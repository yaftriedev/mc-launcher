const { downloadFile, verifyChecksum } = require('./Downloads')
const fs = require('fs');
const path = require('path');

// Constructor
// installReleaseVersion
// downloadLibraries
// downloadAssets
// install -> por definir
// launch -> por definir
// start -> lanza el juego

class MinecraftCore {

  /**
   * @param {string} gameDir - Ruta de la carpeta principal del juego donde se guardan archivos, mods y configuraciones.
   * @param {string} versionId - Identificador de la versión del juego que se quiere ejecutar (por ejemplo: "1.20.1").
   * @param {string} jsonUrl - URL desde donde se descarga el archivo JSON con la información de la versión del juego.
   * @param {string} username - Nombre del jugador que aparecerá dentro del juego.
   * @param {string} javaPath - Ruta del ejecutable de Java que se usará para lanzar el juego.
   * @param {function(string)} log - Ejecuta una funcion para mostrar log de errores y informacion.
   */
  constructor({ gameDir, versionId, jsonUrl, username, javaPath, log }) {
    this.gameDir = gameDir,
    this.versionId = versionId,
    this.jsonUrl = jsonUrl,
    this.username = username,
    this.javaPath = javaPath,
    this.log = log,
    this.versionPath = path.join(gameDir, "versions", versionId)
    this.jsonVersionPath = path.join(this.versionPath, `${versionId}.json`)
    this.classifiersOS = this.getClassifiersOS()
  }

  // Obtiene la etiqueta para identificar en el library.classifier
  getClassifiersOS() {
    switch (process.platform) {
      case "win32":
        return "natives-windows"; // windows
      case "linux":
        return "natives-linux"; // linux
      case "darwin":
        return "natives-macos"; // macOS
      default:
        return null;
    }
  }

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
      await downloadFile(this.jsonUrl, this.jsonVersionPath, (d) => this.log(d))
    }
    
    // Obtener versionMeta
    const versionMeta = require(this.jsonVersionPath)

    // Descargar client.jar
    const clientJarPath = path.join(this.versionPath, `${this.versionId}.jar`)
    const clientJar = versionMeta.downloads.client
    
    if (!fs.existsSync(clientJarPath)) {
      await downloadFile(clientJar.url, clientJarPath, (d) => this.log(d))
    }
    
    // Verificar el sha1 de el client.jar descargado y el original
    if ( !(await verifyChecksum(clientJarPath, clientJar.sha1)) ) {
      this.log("Error, los hashes no coinciden: " + clientJarPath)
      if (fs.existsSync(clientJarPath)) fs.unlinkSync(clientJarPath);
      return false;
    }

    return true;
  }

  /**
   * Descarga todas las librerías definidas en la metadata de la versión.
   * @param {Object} versionMeta - Objeto JSON de metadata de la versión (descargado del manifiesto de Mojang).
   * @param {string} this.gameDir - Carpeta raíz donde se almacenan las librerías (por ejemplo, el directorio de .minecraft).
   * @returns {Promise<void>} Una promesa que se resuelve cuando todas las librerías han sido procesadas.
   */
  async downloadLibraries(versionMeta) {
    
    // Descargar el .jar principal: lib.downloads.artifact
    for (const [index, lib] of versionMeta.libraries.entries()) {
      
      if (!lib.downloads || !lib.downloads.artifact) continue;

      const { url, path: relPath, sha1 } = lib.downloads.artifact;
      const savePath = path.join(this.gameDir, "libraries", relPath);

      if (fs.existsSync(savePath)) continue

      await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
      await downloadFile(url, savePath, (d) => this.log(d));

      if (!( await verifyChecksum(savePath, sha1))) {
        this.log("Error, los hashes no coinciden: " + savePath)
        if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
        return false;
      }

      this.log( `[PROGRESO] ${index}/${versionMeta.libraries.length}`)
    
    }

    // Descagar el native .jar: classifiers.native-{os}
    for (const [index, lib] of versionMeta.libraries.entries()) {

      if (!lib.downloads.classifiers?.[this.classifiersOS]) continue;

      const { url, path: relPath, sha1 } = lib.downloads.classifiers[this.classifiersOS];
      const savePath = path.join(this.gameDir, "libraries", relPath);

      if (fs.existsSync(savePath)) continue

      await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
      await downloadFile(url, savePath, (d) => this.log(d));

      if (!( await verifyChecksum(savePath, sha1))) {
        this.log("Error, los hashes no coinciden: " + savePath)
        if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
        return false;
      }

      this.log( `[PROGRESO] ${index}/${versionMeta.libraries.length}`)

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
      this.log("Error, no existe")
    }

    // Descargar el Json
    const assetsJsonPath = path.join(this.gameDir, "assets", "indexes", assetsUrl.split("/").pop());

    if (!fs.existsSync(assetsJsonPath)) {
      await fs.promises.mkdir(path.dirname(assetsJsonPath), { recursive: true });
      await downloadFile(assetsUrl, assetsJsonPath, (d) => this.log(d));
    } 
    
    // Obtener lista de objetos con relPath y hash
    const assetsJson = require(assetsJsonPath);
    const listAssets = Object.entries(assetsJson.objects).map(([key, value]) => (value.hash));

    for (const [index, hash] of listAssets.entries()) {

      const savePath = path.join(this.gameDir, "assets", "objects", hash.substring(0,2), hash)
      const url = `https://resources.download.minecraft.net/${hash.substring(0,2)}/${hash}`

      if (fs.existsSync(savePath)) continue

      await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
      await downloadFile(url, savePath, (d) => this.log(d));

      if (!( await verifyChecksum(savePath, hash))) {
        this.log("Error, los hashes no coinciden: " + savePath)
        if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
        return false;
      }

      this.log( `[PROGRESO] ${index}/${listAssets.length}`)
    }
  }

  // Instala la version correspondente
  async install() {}
  
  // Lanza el juego
  async launch() {}

  /**
   * @param {string} this.jsonVersionPath - Path al json que contiene las versiones
   * @param {function} this.#install - Instala la version correspondiente
   * @param {function(json)} this.#downloadLibraries - Descargar las librerias requeridas por la version
   * @param {function(json)} this.#downloadAssets - Descargar los assets requeridos por la version
   * @param {function} this.#launch - inicia el juego
   */
  async start() {
    await this.install()

    this.log(`Cargando archivo ${this.jsonVersionPath}`)
    const versionMeta = require(this.jsonVersionPath) 

    await this.downloadLibraries(versionMeta)
    await this.downloadAssets(versionMeta)

    this.log("Starting MC ")
  
    await this.launch()
  }
}

module.exports = { MinecraftCore }