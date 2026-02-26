const { ipcMain, ipcRenderer } = require('electron');
const { LauncherPath, mcInstancesPath, LogPath } = require('./../util/const');
const { fork } = require('child_process');
const path = require('path');

async function LaunchMCHandler(mainWindow) {
  ipcMain.handle('launch-minecraft', async (event, { options }) => {
    try {

      mc_path = path.join( mcInstancesPath, options.name);
      
      const child = fork(LauncherPath, [ LogPath, mc_path, options.version, options.username], {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        detached: true,
        env: process.env
      });

      child.on('message', (msg) => {
        if (msg.type === 'progress') {
          mainWindow.webContents.send('progress-update', msg.percent);
        }
      });

      child.unref();   

      return { success: true };
    } catch (error) {
      console.error('Error launching Minecraft:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { LaunchMCHandler };
