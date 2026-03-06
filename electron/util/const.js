const path = require('path');

const appPath = process.cwd(); // en desarrollo, la raíz del proyecto
// const appPath = app.getPath('userData'); // en producción, la carpeta de datos del usuario

const dataFilePath = path.join(appPath, 'data.json');
const mcInstancesPath = path.join(appPath, 'instances');
const launcherPath = path.join(appPath, 'launcher', 'run.js');
const logPath = path.join(appPath, 'app.log');

release_versions_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
forge_promotions_url = "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json";

module.exports = { appPath, dataFilePath, mcInstancesPath, launcherPath, logPath, release_versions_url, forge_promotions_url };