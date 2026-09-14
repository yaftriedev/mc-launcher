const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer');

contextBridge.exposeInMainWorld('api', {
  openFolder: () => ipcRenderer.invoke('open-folder'),
  openRepoGithub: () => ipcRenderer.invoke('open-repo-github'),

  saveName: (name) => ipcRenderer.invoke('save-name', { name }),
  loadName: () => ipcRenderer.invoke('load-name'),

  getVersions: () => ipcRenderer.invoke('get-versions'),
  getVersionsInstalled: () => ipcRenderer.invoke('get-versions-installed'),

  launchInstance: (options) => ipcRenderer.invoke('launch-minecraft', { options }),

  log: (value) => ipcRenderer.invoke('log', { value }),
  onLog: (callback) => {
    const listener = (_, value) => callback(value);
    ipcRenderer.on('log-update', listener);
    return () => ipcRenderer.removeListener('log-update', listener);
  },

})