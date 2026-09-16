const { app, BrowserWindow } = require('electron');
const path = require('path');

// Importar funciones de las APIs
const { registerHandler } = require('./registerHandler');
const { initStorage } = require('./logic')

app.whenReady().then(async () => {
  // Flag para software rendering
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform'); // opcional en Linux

  await initStorage();

  win = new BrowserWindow({
    width: 1250,
    height: 700,
    icon: path.join(__dirname, "../public/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      offscreen: false
    }
  });

  // Cargar tu React desde dist/index.html o webpack-dev-server
  if (app.isPackaged) { win.loadFile( path.join(__dirname, "../renderer-dist/index.html") ); } 
  else { win.loadURL("http://localhost:8080"); }

  registerHandler(win);
  
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});