const { ipcMain, app } = require('electron');
const path = require('path');

const { StorageManager } = require('./lib/StorageManager');
const { MinecraftManager } = require('./lib/MinecraftManager')
const { fetchVersionsAll } = require('./api/versionsMC');

const { openFolder, log, getJavaPath } = require('./util/file');
const { config } = require('./config');

const storageManager = new StorageManager(config.dataFilePath);

const launchMinecraft = async (win, options) => {
  new MinecraftManager({
    gameDir: path.join(config.mcInstancesPath, "hola"),
    versionId: options.versionId,
    versionType: options.versionType,
    jsonUrl: options.url,
    username: storageManager.loadName(),
    javaPath: await getJavaPath(),
    sendProgress: (p) => win.webContents.send('progress-update', p),
    log: (d) => log(d),
    onClose: () => win.webContents.send('mc-closed')
  }).launch()
}

// Handler para IPC que expone las funciones de almacenamiento a la capa de renderizado
const registerHandler = (win) => {  

  // save name
  ipcMain.handle('save-name', async (event, { name }) => await storageManager.saveName(name));

  // load name
  ipcMain.handle('load-name', async (event) => await storageManager.loadName());

  // save instances
  ipcMain.handle('save-instances', async (event, { instances }) => await storageManager.saveInstances(instances));

  // load instances
  ipcMain.handle('load-instances', async (event) => await storageManager.loadInstances());

  // Progress and MC closed events
  ipcMain.handle('send-progress', (event, { value }) => event.sender.send('progress-update', value));
  ipcMain.handle('send-mc-closed', (event) => event.sender.send('mc-closed'));

  // Get info
  ipcMain.handle('get-info', () => {
    return {
      preloadPath: path.join(__dirname, 'preload.js'),
      userDataPath: app.getPath('userData'),
      version: app.getVersion(),
      author: app.getName(),
      repo: 'yaftriede/mc-launcher',
    }
  });

  // Open folder
  ipcMain.handle('open-folder', (event, {name}) => openFolder(name));

  // Get versions
  ipcMain.handle('get-versions-all', async (event) => fetchVersionsAll());

  // Launch Minecraft
  ipcMain.handle('launch-minecraft', async (event, { options }) => await launchMinecraft(win, options));

}

module.exports = { registerHandler };