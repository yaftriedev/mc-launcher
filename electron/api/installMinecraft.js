const { downloadFile, verifyChecksum } = require('./../util/downloads')
const fs = require('fs');
const path = require('path');

/**
 * Instala una versión del juego descargando los archivos necesarios y verificando su integridad.
 * @param {Object} options - Opciones para la instalación.
 * @param {string} options.versionPath - Ruta donde se creará la carpeta de la versión y se almacenará el client.jar.
 * @param {string} options.jsonVersionPath - Ruta donde se descargará el archivo JSON de la versión.
 * @param {string} options.jsonUrl - URL desde donde se descargará el archivo JSON de la versión.
 * @return {Promise<boolean>} - Devuelve true si coinciden el hash y el client.jar o false si no.
 */
async function installReleaseVersion({
  versionPath,
  jsonVersionPath,
  versionId,
  jsonUrl
}) {
  // Crear carpeta y descargar fichero
  if (!fs.existsSync(jsonVersionPath)) {
    fs.mkdirSync(versionPath, { recursive: true });
    await downloadFile(jsonUrl, jsonVersionPath)
  }
  
  // Obtener versionMeta
  const versionMeta = require(jsonVersionPath)

  // Descargar client.jar
  const clientJarPath = path.join(versionPath, `${versionId}.jar`)
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
 * @param {Object} options - Parámetros de configuración.
 * @param {string|undefined} options.gameDir - Directorio donde está instalado Minecraft y donde se ejecutará la instalación.
 * @param {string|undefined} options.versionId - Identificador de versión en formato similar a:
 * `"forge-<mcVersion>-<forgeVersion>"`. Se usa para extraer la versión de Minecraft y de Forge.
 */
async function installForgeVersion({
  gameDir=undefined, 
  versionId=undefined
}) {
  try {
    
    const mcVersion = versionId.split("-")[0];
    const forgeVersion = versionId.split("-")[2];

    const url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${forgeVersion}/forge-${mcVersion}-${forgeVersion}-installer.jar`
    
    const outputPath = path.join(
      gameDir, "installer",
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
      gameDir
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
 * @param {Object} options - Opciones para la instalación.
 * @param {Object} options.versionMeta - Objeto JSON de metadata de la versión (descargado del manifiesto de Mojang).
 * @param {string} options.minecraftDir - Carpeta raíz donde se almacenan las librerías (por ejemplo, el directorio de .minecraft).
 * @returns {Promise<void>} Una promesa que se resuelve cuando todas las librerías han sido procesadas.
 */
async function downloadLibraries({
  versionMeta, 
  minecraftDir
}) {
  for (const lib of versionMeta.libraries) {
    if (!lib.downloads || !lib.downloads.artifact) continue;

    const { url, path: relPath, sha1 } = lib.downloads.artifact;
    const savePath = path.join(minecraftDir, "libraries", relPath);

    if (fs.existsSync(savePath)) continue

    await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
    await downloadFile(url, savePath);

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
 * @param {Object} options - Opciones para la instalación.
 * @param {Object} options.versionMeta - Objeto JSON de metadata de la versión (descargado del manifiesto de Mojang).
 * @param {string} options.minecraftDir - Carpeta raíz donde se almacenan los assets (por ejemplo, el directorio de .minecraft).
 * @returns {Promise<void>} Una promesa que se resuelve cuando todas las librerías han sido procesadas.
 */
async function downloadAssets({
  versionMeta, 
  minecraftDir
}) {

  // Obtener ruta del archivo de assets .json 
  const assetsUrl = versionMeta.assetIndex.url
  
  if (!assetsUrl) {
    console.log("Error, no existe")
  }

  // Descargar el Json
  const assetsJsonPath = path.join(minecraftDir, "assets", "indexes", assetsUrl.split("/").pop());

  if (!fs.existsSync(assetsJsonPath)) {
    await fs.promises.mkdir(path.dirname(assetsJsonPath), { recursive: true });
    await downloadFile(assetsUrl, assetsJsonPath);
  }
  
  // Obtener lista de objetos con relPath y hash
  const assetsJson = require(assetsJsonPath);
  const listAssets = Object.entries(assetsJson.objects).map(([key, value]) => (value.hash));

  for (const hash of listAssets) {

    const savePath = path.join(minecraftDir, "assets", "objects", hash.substring(0,2), hash)
    const url = `https://resources.download.minecraft.net/${hash.substring(0,2)}/${hash}`

    if (fs.existsSync(savePath)) continue

    await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
    await downloadFile(url, savePath);

    if (!verifyChecksum(savePath, hash)) {
      console.log("Error, los hashes no coinciden: " + savePath)
      if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
      return false;
    }
  }
}

module.exports = { downloadAssets, downloadLibraries, installReleaseVersion, installForgeVersion }