const { ipcMain } = require('electron');
const { LauncherPath, mcInstancesPath } = require('./../util/const');
const { fork } = require('child_process');
const path = require('path');

async function LaunchMCHandler() {
  ipcMain.handle('launch-minecraft', async (event, { options }) => {
    try {

      mc_path = path.join( mcInstancesPath, options.name);
      
      const child = fork(LauncherPath, [ mc_path, options.version, options.username], {
        stdio: 'ignore',
        detached: true,
        env: process.env
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
