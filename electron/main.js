const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { preload } = require('react-dom');

ipcMain.handle('get-info', () => {
  return {
    preloadPath: path.join(__dirname, 'preload.js'),
    userDataPath: app.getPath('userData')
  }
});

app.commandLine.appendSwitch('disable-gpu'); // desactiva GPU
app.commandLine.appendSwitch('disable-software-rasterizer'); // desactiva rasterizador de software
app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform'); // opcional en Linux

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            offscreen: false
        }
    });

    // Cargar tu React desde webpack-dev-server
    win.loadURL('http://localhost:8080');
}

app.whenReady().then(() => {
    // Flag para software rendering
    app.commandLine.appendSwitch('disable-gpu');
    app.commandLine.appendSwitch('disable-software-rasterizer');

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});