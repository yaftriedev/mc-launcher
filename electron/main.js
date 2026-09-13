const { app, BrowserWindow } = require('electron');
const path = require('path');

// Importar funciones de las APIs
const { registerHandler } = require('./registerHandler');
const { StorageManager } = require('./lib/StorageManager')
const { config } = require("./config");

// Inicializar las APIs
new StorageManager(config.dataFilePath).initStorage()

app.whenReady().then(() => {
  // Flag para software rendering
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform'); // opcional en Linux

  win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, "../public/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      offscreen: false
    }
  });

  // Cargar tu React desde webpack-dev-server
  win.loadURL('http://localhost:8080');

  registerHandler(win);
  
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});