const { contextBridge, ipcRenderer } = require('electron');

console.log("PRELOAD OK");

const path = require('path');
const storage = require(path.join(__dirname, 'api', 'storage.js'));

console.log("PRELOAD 2 OK");

contextBridge.exposeInMainWorld('api', {
  storage: {
    guardar: (data) => ipcRenderer.invoke('guardar-datos', data),
    leer: () => ipcRenderer.invoke('leer-datos')
  }
});