const { mcInstancesPath } = require('./../util/const');
const path = require('path');
const fs = require('fs')
const { launch } = require('@xmcl/core')
const { log, getJavaPath } = require('../util/file.js')
const { downloadAssets, downloadLibraries, installReleaseVersion, installForgeVersion } = require('./installMinecraft.js')

/**
 * Lanza una instancia de Minecraft.
 *
 * @param {import("electron").BrowserWindow} mainWindow - Ventana principal de Electron usada para enviar eventos al frontend.
 * @param {Object} options - Opciones de lanzamiento.
 * @param {string} options.name - Nombre de la instancia de Minecraft (carpeta dentro de mcInstancesPath).
 * @param {string} options.versionId - Versión de Minecraft que se va a ejecutar.
 * @param {string} options.username - Nombre de usuario que usará el jugador dentro del juego.
 *
 * @returns {Promise<{success: boolean, error?: string}>}
 * Devuelve un objeto indicando si el lanzamiento fue exitoso.
 * - `success: true` si el juego se inicia correctamente.
 * - `success: false` si ocurre un error, incluyendo el mensaje en `error`.
 */
async function LaunchMinecraft(mainWindow, {name, versionId, versionType, url, username}) {
  try {

    const gameDir = path.join(mcInstancesPath, name);
    const javaPath = await getJavaPath();

    const versionPath = path.join(gameDir, "versions", versionId)
    const jsonVersionPath = path.join(versionPath, `${versionId}.json`)
      
    if (versionType === "release") {
      await installReleaseVersion({
        versionPath: versionPath,
        jsonVersionPath: jsonVersionPath,
        versionId: versionId,
        jsonUrl: url
      })
    }

    else if (versionType === "forge") {
      if (!fs.existsSync(versionPath)) {
        await installForgeVersion({
          gameDir: gameDir,
          versionId: versionId
        })
      }
    }

    else log("Type Error: " + versionType)

    const versionMeta = require(jsonVersionPath) 

    await downloadLibraries({
      versionMeta: versionMeta,
      minecraftDir: gameDir
    })

    await downloadAssets({
      versionMeta: versionMeta,
      minecraftDir: gameDir
    })

    log(" Starting MC ")
  
    const proc = await launch({
      gamePath: gameDir,
      version: versionId,
      javaPath: javaPath,
      // minMemory: minMemory,
      // maxMemory: maxMemory,
      authorization: {
        accessToken: "0",
        clientToken: "0",
        uuid: "00000000-0000-0000-0000-000000000000",
        name: username,
        userType: "mojang"
      }
    })

    proc.stdout.on('data', data => log(data.toString()))
    proc.stderr.on('data', data => log(data.toString()))
    proc.on('close', code => {
      log(`Juego cerrado con código ${code}`);
      mainWindow.webContents.send('mc-closed');
    })

    return { success: true };
  } catch (error) {
    console.error('Error launching Minecraft:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { LaunchMinecraft };
