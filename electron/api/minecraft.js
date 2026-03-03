const { LauncherPath, mcInstancesPath, LogPath } = require('./../util/const');
const { getVersionList } = require("@xmcl/installer");
const { fork } = require('child_process');
const path = require('path');

function LaunchMinecraft(mainWindow, options) {
  try {

    mc_path = path.join(mcInstancesPath, options.name);
    
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

    child.on('message', (msg) => {
      if (msg.type === 'mc-closed') {
        mainWindow.webContents.send('mc-closed');
      }
    });

    child.unref();   

    return { success: true };
  } catch (error) {
    console.error('Error launching Minecraft:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { LaunchMinecraft };
