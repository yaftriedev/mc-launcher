const { ipcMain } = require('electron');
const { 
  storageManager, openFolder, openRepoGithub, 
  getVersions, getVersionsInstalled, launchMinecraft
} = require('./logic')

// Handler para IPC que expone las funciones de almacenamiento a la capa de renderizado
const registerHandler = (win) => {  

  // save name
  ipcMain.handle('save-name', async (event, { name }) => await storageManager.saveName(name));

  // load name
  ipcMain.handle('load-name', async (event) => await storageManager.loadName());

  // Progress and MC closed events
  ipcMain.handle('log', (event, {value}) => event.sender.send('log-update', value));

  // Open github repo
  ipcMain.handle('open-repo-github', (event) => openRepoGithub());

  // Open folder
  ipcMain.handle('open-folder', (event) => openFolder());

  // Get versions
  ipcMain.handle('get-versions', async (event) => await getVersions());

  // Get versions installed
  ipcMain.handle('get-versions-installed', (event) => getVersionsInstalled());

  // Launch Minecraft
  ipcMain.handle('launch-minecraft', async (event, { v }) => await launchMinecraft(win, v));

}

module.exports = { registerHandler  };