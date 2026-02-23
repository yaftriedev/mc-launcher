const { app, ipcMain } = require('electron');
const path = require('path');

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
}

module.exports = { getInfo };