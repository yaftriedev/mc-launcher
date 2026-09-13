const { createWriteStream } = require('fs')
const fs = require('fs').promises;
const os = require('os')
const path = require('path');
const { shell } = require('electron');
const { exec } = require('child_process')
const { config } = require('../config');

async function openFolder(name) {
  const folderPath = path.join(config.mcInstancesPath, name);
  
  try {
    await fs.access(folderPath);
    shell.openPath(folderPath);
  } catch (error) {
    shell.openPath(config.mcInstancesPath);
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

const logStream = createWriteStream(config.logPath, { flags: "w" });
const log = (msg) => {
  if (logStream.writableEnded) return; 
  logStream.write(msg);
}

module.exports = { openFolder, getJavaPath, log };