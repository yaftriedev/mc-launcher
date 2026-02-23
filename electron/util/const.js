const { app } = require('electron');
const path = require('path');

const appPath = app.isPackaged
  ? path.join(process.resourcesPath, 'app')  // ruta de app.asar + carpeta app
  : process.cwd();                           // en desarrollo, la raíz del proyecto

const dataFilePath = path.join(appPath, 'data.json');

const versions_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

module.exports = { appPath, dataFilePath, versions_url };