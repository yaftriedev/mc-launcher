const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer')

contextBridge.exposeInMainWorld('data', {
  saveInstances: (data) => window.localStorage.setItem('mc-launcher-instances', JSON.stringify(data)),
  loadInstances: () => {
    const data = window.localStorage.getItem('mc-launcher-instances');
    return data ? JSON.parse(data) : null;
  },
  saveName: (name) => window.localStorage.setItem('mc-launcher-name', name),
  loadName: () => window.localStorage.getItem('mc-launcher-name') || "Steve",
  getInfo: () => {
    return ipcRenderer.invoke('get-info');
  },
})