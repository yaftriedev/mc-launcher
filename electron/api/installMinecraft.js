const { downloadFile, verifyChecksum } = require('./../util/downloads')
const { launch } = require('@xmcl/core')
const fs = require('fs');
const path = require('path');

class MinecraftInstaller {

  /**
   * @param {string} gameDir - Ruta de la carpeta principal del juego donde se guardan archivos, mods y configuraciones.
   * @param {string} versionId - Identificador de la versión del juego que se quiere ejecutar (por ejemplo: "1.20.1").
   * @param {string} versionType - Tipo de versión del juego (release, snapshot, modded, etc.).
   * @param {string} jsonUrl - URL desde donde se descarga el archivo JSON con la información de la versión del juego.
   * @param {string} username - Nombre del jugador que aparecerá dentro del juego.
   * @param {string} javaPath - Ruta del ejecutable de Java que se usará para lanzar el juego.
   * @param {function(int)} sendProgress - Ejecuta una funcion con el porcentaje de progreso en descargas
   */
  constructor({ gameDir, versionId, versionType, jsonUrl, username, javaPath, sendProgress }) {
    this.gameDir = gameDir,
    this.versionId = versionId,
    this.versionType = versionType,
    this.jsonUrl = jsonUrl,
    this.username = username,
    this.javaPath = javaPath,
    this.sendProgress = sendProgress,
    this.versionPath = path.join(gameDir, "versions", versionId)
    this.jsonVersionPath = path.join(this.versionPath, `${versionId}.json`)
  }

  /**
   * @return {string} jsonVersionPath - Propiedades definidas por el constructor a mayores
   */
  getJsonVersionPath = () => this.jsonVersionPath

  /**
   * Instala una versión del juego descargando los archivos necesarios y verificando su integridad.
   * @param {string} this.versionPath - Ruta donde se creará la carpeta de la versión y se almacenará el client.jar.
   * @param {string} this.jsonVersionPath - Ruta donde se descargará el archivo JSON de la versión.
   * @param {string} this.jsonUrl - URL desde donde se descargará el archivo JSON de la versión.
   * @return {Promise<boolean>} - Devuelve true si coinciden el hash y el client.jar o false si no.
   */
  async installReleaseVersion() {
    // Crear carpeta y descargar fichero
    if (!fs.existsSync(this.jsonVersionPath)) {
      fs.mkdirSync(this.versionPath, { recursive: true });
      await downloadFile(this.jsonUrl, this.jsonVersionPath)
    }
    
    // Obtener versionMeta
    const versionMeta = require(this.jsonVersionPath)

    // Descargar client.jar
    const clientJarPath = path.join(this.versionPath, `${this.versionId}.jar`)
    const clientJar = versionMeta.downloads.client
    
    if (!fs.existsSync(clientJarPath)) await downloadFile(clientJar.url, clientJarPath)
    
    // Verificar el sha1 de el client.jar descargado y el original
    if (!verifyChecksum(clientJarPath, clientJar.sha1)) {
      console.log("Error, los hashes no coinciden: " + clientJarPath)
      if (fs.existsSync(clientJarPath)) fs.unlinkSync(clientJarPath);
      return false;
    }

    return true;
  }

  /**
   * Descarga el instalador de Forge correspondiente a una versión específica de Minecraft y ejecuta el instalador en el directorio del juego.
   * @param {string|undefined} this.gameDir - Directorio donde está instalado Minecraft y donde se ejecutará la instalación.
   * @param {string|undefined} this.versionId - Identificador de versión en formato similar a:
   * `"forge-<mcVersion>-<forgeVersion>"`. Se usa para extraer la versión de Minecraft y de Forge.
   */
  async installForgeVersion() {
    try {
      
      const mcVersion = this.versionId.split("-")[0];
      const forgeVersion = this.versionId.split("-")[2];

      const url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${forgeVersion}/forge-${mcVersion}-${forgeVersion}-installer.jar`
      
      const outputPath = path.join(
        this.gameDir, "installer",
        `forge-${mcVersion}-${forgeVersion}-installer.jar`
      );

      console.log("Descargando...");
      await downloadFile(url, outputPath);

      console.log("Descarga completada:");
      console.log(outputPath);

      const child = spawn('java', [
        '-jar',
        outputPath,
        '--installClient',
        this.gameDir
      ], {
        stdio: 'inherit',
        env: process.env
      });

    } catch (err) {
      console.error("Error:", err.message);
    }
  }

  /**
   * Descarga todas las librerías definidas en la metadata de la versión.
   * @param {Object} versionMeta - Objeto JSON de metadata de la versión (descargado del manifiesto de Mojang).
   * @param {string} this.gameDir - Carpeta raíz donde se almacenan las librerías (por ejemplo, el directorio de .minecraft).
   * @returns {Promise<void>} Una promesa que se resuelve cuando todas las librerías han sido procesadas.
   */
  async downloadLibraries(versionMeta) {
    for (const [index, lib] of versionMeta.libraries.entries()) {
      if (!lib.downloads || !lib.downloads.artifact) continue;

      const { url, path: relPath, sha1 } = lib.downloads.artifact;
      const savePath = path.join(this.gameDir, "libraries", relPath);

      if (fs.existsSync(savePath)) continue

      await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
      await downloadFile(url, savePath);

      this.sendProgress( (index / versionMeta.libraries.length) * 100 )

      if (!verifyChecksum(savePath, sha1)) {
        console.log("Error, los hashes no coinciden: " + savePath)
        if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
        return false;
      }
    }

    return true;
  }

  /**
   * Descarga todas los assets definidos en la metadata de la versión.
   * @param {Object} versionMeta - Objeto JSON de metadata de la versión (descargado del manifiesto de Mojang).
   * @param {string} this.gameDir - Carpeta raíz donde se almacenan los assets (por ejemplo, el directorio de .minecraft).
   * @returns {Promise<void>} Una promesa que se resuelve cuando todas las librerías han sido procesadas.
   */
  async downloadAssets(versionMeta) {

    // Obtener ruta del archivo de assets .json 
    const assetsUrl = versionMeta.assetIndex.url
    
    if (!assetsUrl) {
      console.log("Error, no existe")
    }

    // Descargar el Json
    const assetsJsonPath = path.join(this.gameDir, "assets", "indexes", assetsUrl.split("/").pop());

    if (!fs.existsSync(assetsJsonPath)) {
      await fs.promises.mkdir(path.dirname(assetsJsonPath), { recursive: true });
      await downloadFile(assetsUrl, assetsJsonPath);
    }
    
    // Obtener lista de objetos con relPath y hash
    const assetsJson = require(assetsJsonPath);
    const listAssets = Object.entries(assetsJson.objects).map(([key, value]) => (value.hash));

    for (const [index, hash] of listAssets.entries()) {

      const savePath = path.join(this.gameDir, "assets", "objects", hash.substring(0,2), hash)
      const url = `https://resources.download.minecraft.net/${hash.substring(0,2)}/${hash}`

      if (fs.existsSync(savePath)) continue

      await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
      await downloadFile(url, savePath);

      this.sendProgress( (index / listAssets.length) * 100 )

      if (!verifyChecksum(savePath, hash)) {
        console.log("Error, los hashes no coinciden: " + savePath)
        if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
        return false;
      }
    }
  }

  /**
   * Lanza el juego usando la configuración almacenada en la clase.
   * @param {string} this.gameDir - Carpeta principal del juego. Aquí están versiones, librerías, assets, etc.
   * @param {string} this.versionId - Identificador de la versión que se quiere ejecutar.
   * @param {string} this.javaPath - Ruta al ejecutable de Java que iniciará el juego.
   * @param {string} this.username - Nombre del jugador que aparecerá dentro del juego.
   * @param {function(Buffer)} onData - Se ejecuta cuando el juego envía información por stdout (logs normales).
   * @param {function(Buffer)} onError - Se ejecuta cuando el juego envía errores por stderr.
   * @param {function(number)} onClose - Se ejecuta cuando el proceso de Minecraft se cierra.
   */
  async launch(
    onData = (data) => {}, 
    onError = (data) => {},
    onClose = (code) => {}
  ) {
    try {
      const proc = await launch({
        gamePath: this.gameDir,
        version: this.versionId,
        javaPath: this.javaPath,
        // minMemory: minMemory,
        // maxMemory: maxMemory,
        authorization: {
          accessToken: "0",
          clientToken: "0",
          uuid: "00000000-0000-0000-0000-000000000000",
          name: this.username,
          userType: "mojang"
        }
      })

      proc.stdout.on('data', onData)
      proc.stderr.on('data', onError)
      proc.on('close', onClose)
    }

    catch (err) { onError(err) }
  }
}

module.exports = { MinecraftInstaller }

// 