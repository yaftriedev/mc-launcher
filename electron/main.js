const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { preload } = require('react-dom');

// Importar funciones de las APIs
const { initStorage, storageHandler } = require('./api/storage');
const { getInfo } = require('./api/info');
const { VersionsHandler, fetchVersions } = require('./api/mc-versiones');

// Inicializar las APIs
initStorage()
  .then(result => console.log(result.message))
  .catch(error => console.error("Error initializing storage:", error));
storageHandler();
getInfo();
VersionsHandler();

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
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform'); // opcional en Linux

  fetchVersions().then(() => createWindow());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});