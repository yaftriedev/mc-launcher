const { createWriteStream } = require('fs')
const fs = require('fs').promises;
const os = require('os')
const path = require('path');
const { shell } = require('electron');
const { exec } = require('child_process')
const { mcInstancesPath, logPath } = require('./const');

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

const getJavaPath = async () =>
  new Promise((res, rej) =>
    exec(os.platform() === "win32" ? "where java" : "which java",
      (e, out) => e || !out
        ? rej(new Error("Java no encontrado"))
        : res(out.split("\n")[0].trim())
    )
  );

const logStream = createWriteStream(logPath, { flags: "w" });
const log = (msg) => {
  if (logStream.writableEnded) return; 
  logStream.write(msg);
}

module.exports = { save, load, openFolder, getJavaPath, log };