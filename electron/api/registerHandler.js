const { ipcMain, app } = require('electron');
const path = require('path');

const { saveName, loadName, saveInstances, loadInstances, initStorage } = require('./storage');
const { LaunchMinecraft } = require('./minecraft');
const { fetchReleaseVersions, fetchForgeVersions, fetchVersionsAll } = require('./versionsMC');

const { save, load, openFolder } = require('./../util/file');
const { dataFilePath } = require('./../util/const');

// Handler para IPC que expone las funciones de almacenamiento a la capa de renderizado
function registerHandler(win) {  
  
  // save file
  ipcMain.handle('save-data', async (event, { data }) =>  await save(data, dataFilePath))

  // load file
  ipcMain.handle('load-data', async (event) => await load(dataFilePath));

  // save name
  ipcMain.handle('save-name', async (event, { name }) => await saveName(name));

  // load name
  ipcMain.handle('load-name', async (event) => await loadName());

  // save instances
  ipcMain.handle('save-instances', async (event, { instances }) => await saveInstances(instances));

  // load instances
  ipcMain.handle('load-instances', async (event) => await loadInstances());

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
  ipcMain.handle('get-versions-release', async (event) => fetchReleaseVersions());
  ipcMain.handle('get-versions-forge', async (event) => fetchForgeVersions());

  // Launch Minecraft
  ipcMain.handle('launch-minecraft', async (event, { options }) => await LaunchMinecraft(win, options));

}

module.exports = { initStorage, registerHandler, initStorage };