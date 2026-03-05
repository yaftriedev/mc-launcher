const { install } = require('@xmcl/installer');
const { handleProgress, getArgs, downloadFile, verifyChecksum } = require('./util')
const fs = require('fs');
const path = require('path');
const { hash } = require('crypto');

/**
 * Instala una versión del juego descargando los archivos necesarios y verificando su integridad.
 * @param {Object} options - Opciones para la instalación.
 * @param {string} options.versionPath - Ruta donde se creará la carpeta de la versión y se almacenará el client.jar.
 * @param {string} options.jsonVersionPath - Ruta donde se descargará el archivo JSON de la versión.
 * @param {string} options.jsonUrl - URL desde donde se descargará el archivo JSON de la versión.
 * @return {Promise<boolean>} - Devuelve true si coinciden el hash y el client.jar o false si no.
 */
async function downloadVersion({
  versionPath,
  jsonVersionPath,
  jsonUrl
}) {
  // Crear carpeta y descargar fichero
  fs.mkdirSync(versionPath, { recursive: true });
  await downloadFile(jsonUrl, jsonVersionPath)

  // Obtener versionMeta
  const versionMeta = require(jsonVersionPath)

  // Descargar client.jar
  const clientJarPath = path.join(versionPath, `${versionId}.jar`)
  const clientJar = versionMeta.downloads.client
  await downloadFile(clientJar.url, clientJarPath)
  
  // Verificar el sha1 de el client.jar descargado y el original
  if (!verifyChecksum(clientJarPath, clientJar.sha1)) {
    console.log("Error, los hashes no coinciden: " + clientJarPath)
    if (fs.existsSync(clientJarPath)) fs.unlinkSync(clientJarPath);
    return false;
  }

  return true;
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

async function downloadAssets({
  versionMeta, 
  minecraftDir
}) {

  // Obtener ruta del archivo de assets .json 
  const assetsUrl = versionMeta.assetIndex.url
  
  if (!assetsUrl) {
    console.log("Error, no existe")
  }

  // Obtener json del archivo
  const res = await fetch(assetsUrl);

  if (!res.ok) throw new Error(`Error al descargar JSON: ${res.status} ${res.statusText}`);
  const assetsJson = await res.json();

  // Obtener lista de objetos con relPath y hash
  const listAssets = Object.entries(assetsJson.objects).map(([key, value]) => (value.hash));

  for (const hash of listAssets) {

    const savePath = path.join(minecraftDir, "assets", "objects", hash.substring(0,2), hash)
    const url = `https://resources.download.minecraft.net/${hash.substring(0,2)}/${hash}`
    
    await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
    await downloadFile(url, savePath);

    if (!verifyChecksum(savePath, hash)) {
      console.log("Error, los hashes no coinciden: " + savePath)
      if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
      return false;
    }

  }

}

async function installRelease({ 
  jsonUrl, 
  versionId, 
  gameDir
}) {
  try {
    
    const versionPath = path.join(gameDir, "versions", versionId)
    const jsonVersionPath = path.join(versionPath, `${versionId}.json`)

    if (!fs.existsSync(versionPath)) {
      downloadVersion({
        versionPath: versionPath,
        jsonVersionPath: jsonVersionPath,
        jsonUrl: jsonUrl
      })
    }

    const versionMeta = require(jsonVersionPath) 

    // await downloadLibraries({
    //   versionMeta: versionMeta,
    //   minecraftDir: gameDir
    // })

    await downloadAssets({
      versionMeta: versionMeta,
      minecraftDir: gameDir
    })
    
    return { "installed": true, "err": false};

  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = { downloadAssets, downloadLibraries, downloadVersion, installRelease }

// Ejemplo de uso
installRelease({
  "jsonUrl": "https://piston-meta.mojang.com/v1/packages/8b2e55c0b18754cb5ff96a0db99bfdbc81679691/1.21.11.json",
  "gameDir": "C:/Users/Yaftrie/Documents/mc-launcher/instances/hola",
  "versionId": "1.21.11"
});
