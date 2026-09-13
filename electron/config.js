const path = require('path');

const appPath = process.cwd();

const config = {

    // Ruta principal del proyecto
    "appPath": appPath,
    
    // Ruta del archivo data.json: Nombre de usuario y instancias
    "dataFilePath": path.join(appPath, 'data.json'),
    
    // Ruta a la carpeta de instancias
    "mcInstancesPath": path.join(appPath, 'instances'),
    
    // !!!! Comprobar si se usa
    "launcherPath": path.join(appPath, 'launcher', 'run.js'),
    
    // Ruta al archivo de log: app.log
    "logPath": path.join(appPath, 'app.log'),

    // RELEASE JSON: Ruta al json que contiene la información de descarga de release de minecraft
    "release_versions_url": "https://launchermeta.mojang.com/mc/game/version_manifest.json",

    // FORGE JSON: Ruta al json que contiene la información de descarga de forge de minecraft
    "forge_promotions_url": "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"
}

module.exports = { config }

