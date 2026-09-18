const { exec } = require('child_process');
const { shell, app } = require('electron');
const fs = require("fs");
const path = require('path');
const os = require('os');

// Ruta principal
const appPath = path.join(app.getPath('userData'), '.minecraft');
// const appPath = path.join(process.cwd(), '.minecraft');

// Otras Rutas
const versionsPath = path.join(appPath, "versions");
const dataPath = path.join(appPath, 'data.json');

// Abrir repo github
const openRepoGithub = () => shell.openExternal("https://github.com/yaftriedev/mc-launcher");

// Abrir carpeta .minecraft
const openFolder = () => shell.openPath(appPath)

// Obtener ruta java
const getJavaPath = async () =>
  new Promise((res, rej) =>
    exec(os.platform() === "win32" ? "where java" : "which java",
      (e, out) => e || !out
        ? rej(new Error("Java no encontrado"))
        : res(out.split("\n")[0].trim())
    )
  );

// Inicacion del almacenamiento data.json
const { StorageManager } = require('./lib/StorageManager');

const storageManager = new StorageManager(dataPath);

// Minecraft Logic: getVersions, launchMinecraft
const { MinecraftRelease } = require('./lib/MinecraftRelease')
const { getVersions } = require('./lib/VersionManager');

const getVersionsInstalled = () => fs.readdirSync(versionsPath, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

const launchMinecraft = async (win, version) => {
  const minecraftConfig = {
    gameDir: appPath,
    versionId: version.versionId,
    versionType: version.versionType,
    jsonUrl: version.url,
    username: await storageManager.loadName(),
    javaPath: await getJavaPath(),
    log: (d) => win.webContents.send('log-update', d.toString()),
  }
  
  new MinecraftRelease(minecraftConfig).start()
}

// Inicializa el almacenamiento
const initStorage = () => storageManager.initStorage()

module.exports = {
    appPath, dataPath,
    openFolder, openRepoGithub,
    getJavaPath,
    getVersions, getVersionsInstalled, launchMinecraft,
    storageManager, initStorage
}