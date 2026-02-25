const { app, ipcMain, shell } = require('electron');
const { mcInstancesPath } = require('../util/const');
const path = require('path');
const fs = require('fs');

function getInfo() {
  ipcMain.handle('get-info', () => {
    return {
      preloadPath: path.join(__dirname, 'preload.js'),
      userDataPath: app.getPath('userData'),
      version: app.getVersion(),
      author: app.getName(),
      repo: 'yaftriede/mc-launcher',
    }
  });

  ipcMain.handle('open-folder', (event, {name}) => {
    const folderPath = path.join(mcInstancesPath, name);
    
    if (!fs.existsSync(folderPath)) {
      shell.openPath(mcInstancesPath);
      return;
    }

    shell.openPath(folderPath);
  });

}

module.exports = { getInfo };