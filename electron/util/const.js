const path = require('path');

const appPath = process.cwd(); // en desarrollo, la raíz del proyecto
// const appPath = app.getPath('userData'); // en producción, la carpeta de datos del usuario

const dataFilePath = path.join(appPath, 'data.json');
const mcInstancesPath = path.join(appPath, 'instances');
const LauncherPath = path.join(appPath, 'launcher', 'launch.js');
const LogPath = path.join(appPath, 'app.log');

module.exports = { appPath, dataFilePath, mcInstancesPath, LauncherPath, LogPath };