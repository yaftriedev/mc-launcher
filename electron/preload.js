const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer')

contextBridge.exposeInMainWorld('api', {
  getInfo: () => ipcRenderer.invoke('get-info'),
  openFolder: (name) => ipcRenderer.invoke('open-folder', { name }),

  saveInstances: (data) => ipcRenderer.invoke('save-instances', { instances: data }),
  loadInstances: () => ipcRenderer.invoke('load-instances'),
  
  saveName: (name) => ipcRenderer.invoke('save-name', { name }),
  loadName: () => ipcRenderer.invoke('load-name'),
  
  saveData: (data) => ipcRenderer.invoke('save-data', { data }), 
  loadData: () => ipcRenderer.invoke('load-data'),

  getVersionsRelease: () => ipcRenderer.invoke('get-versions-release'),
  getVersionsAll: () => ipcRenderer.invoke('get-versions-all'),

  launchInstance: (options) => ipcRenderer.invoke('launch-minecraft', { options }),

  onProgress: (callback) => ipcRenderer.on('progress-update', (_, value) => callback(value)),
  sendProgress: (value) => ipcRenderer.invoke('send-progress', { value }),

  onMCClosed: (callback) => ipcRenderer.on('mc-closed', () => callback()),
  sendMCClosed: () => ipcRenderer.invoke('send-mc-closed')

})