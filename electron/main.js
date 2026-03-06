const { app, BrowserWindow } = require('electron');
const path = require('path');

// Importar funciones de las APIs
const { registerHandler } = require('./registerHandler');
const { initStorage } = require('./api/storage')

// Inicializar las APIs
initStorage()
  .then(result => console.log(result.message))
  .catch(error => console.error("Error initializing storage:", error));

let win = null;

// Crear la ventana principal de la aplicación
function createWindow() {
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

}

app.whenReady().then(() => {
  // Flag para software rendering
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform'); // opcional en Linux

  createWindow(); 
  registerHandler(win);
  
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});