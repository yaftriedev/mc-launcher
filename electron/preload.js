const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer')

contextBridge.exposeInMainWorld('data', {
  getInfo: () => ipcRenderer.invoke('get-info'),

  saveInstances: (data) => ipcRenderer.invoke('save-instances', { instances: data }),
  loadInstances: () => ipcRenderer.invoke('load-instances'),
  
  saveName: (name) => ipcRenderer.invoke('save-name', { name }),
  loadName: () => ipcRenderer.invoke('load-name'),
  
  saveData: (data) => ipcRenderer.invoke('save-data', { data }), 
  loadData: () => ipcRenderer.invoke('load-data')
})