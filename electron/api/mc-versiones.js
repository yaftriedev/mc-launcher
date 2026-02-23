const { versions_url } = require('./../util/const');
const { ipcMain } = require('electron');

let cacheVersions = [];

async function fetchVersions() {
  try {
    const response = await fetch(versions_url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const manifest = await response.json();

    const releaseVersions = manifest.versions
      .filter(v => v.type === "release")
      .map(v => ({
        id: v.id,
        type: v.type,
        url: v.url,
        releaseTime: v.releaseTime
      }));

    cacheVersions = releaseVersions;
    
  } catch (error) {
    console.error("Error al obtener versiones:", error);
    return ["Error al obtener versiones"];
  }
}

async function VersionsHandler() {
  ipcMain.handle('get-versions-release', async (event) => {
    return cacheVersions;
  });
}

module.exports = { VersionsHandler, fetchVersions };