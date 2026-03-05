const { LauncherPath, mcInstancesPath, LogPath } = require('./../util/const');
const { fork } = require('child_process');
const path = require('path');

async function LaunchMinecraft(mainWindow, options) {
  try {

    const mc_path = path.join(mcInstancesPath, options.name);

    const child = fork(LauncherPath, [ LogPath, mc_path, options.version, options.username], {
      // stdio: ['ignore', 'ignore', 'ignore', 'ipc'], // for test
      stdio: ['ignore','inherit','inherit','ipc'], // for production
      detached: true,
      env: process.env,
      cwd: path.dirname(LauncherPath)
    });

    child.on('exit', (code) => {
      mainWindow.webContents.send('mc-closed');
      console.log('mc-closed', code);
    });

    child.unref();   

    return { success: true };
  } catch (error) {
    console.error('Error launching Minecraft:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { LaunchMinecraft };
