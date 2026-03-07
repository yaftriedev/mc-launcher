const { mcInstancesPath } = require('./../util/const');
const { MinecraftInstaller } = require('./installMinecraft.js')
const path = require('path');
const fs = require('fs')
const { log, getJavaPath } = require('../util/file.js')

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

    const minecraftInstaller = new MinecraftInstaller({
      gameDir: gameDir,
      versionId: versionId,
      versionType: versionType,
      jsonUrl: url,
      username: username,
      javaPath: javaPath,
      sendProgress: (p) => mainWindow.webContents.send('progress-update', p)
    })
      
    if (versionType === "release") await minecraftInstaller.installReleaseVersion()

    else if (versionType === "forge") {
      if (!fs.existsSync(versionPath)) await minecraftInstaller.installForgeVersion()
    }

    else log("Type Error: " + versionType)

    const versionMeta = require(minecraftInstaller.getJsonVersionPath()) 

    await minecraftInstaller.downloadLibraries(versionMeta)

    await minecraftInstaller.downloadAssets(versionMeta)

    log(" Starting MC ")
  
    await minecraftInstaller.launch(
      (data) => log(data.toString()),
      (err) => log(err.toString()),
      (code) => {
        log(`Juego cerrado con código ${code}`);
        mainWindow.webContents.send('mc-closed');
      }
    )

    return { success: true };
  } catch (error) {
    console.error('Error launching Minecraft:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { LaunchMinecraft };
