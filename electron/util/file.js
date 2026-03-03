const fs = require('fs').promises;
const path = require('path');
const { shell } = require('electron');
const { mcInstancesPath } = require('./const');

async function save(data, filePath) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function load(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function openFolder(name) {
  const folderPath = path.join(mcInstancesPath, name);
  
  try {
    await fs.access(folderPath);
    shell.openPath(folderPath);
  } catch (error) {
    shell.openPath(mcInstancesPath);
  }
}

module.exports = { save, load, openFolder };