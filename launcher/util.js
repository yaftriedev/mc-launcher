// import fs from 'fs';
// import path from 'path';
// import { exec } from "child_process"
// import os from "os"

const fs = require('fs');
const path = require('path')
const { exec } = require("child_process")
const os = require("os")
const https = require("https");
const crypto = require('crypto');

const release_versions_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

class Log {
  constructor(logPath) { this.logStream = fs.createWriteStream(logPath, { flags: "w" });
    return (msg) => { if (this.logStream.writableEnded) return; this.logStream.write(msg); }
  }
}

/**
  * @param {array} getArgs: Procesa los argumentos de la línea de comandos y devuelve un objeto con las opciones.
  * @return {array} args:
    * logPath: Ruta del archivo de log
    * mc_path: Ruta del directorio de Minecraft
    * versionId: ID de la versión a lanzar
    * username: Nombre de usuario para el juego
    * minMem: Memoria mínima asignada al juego (en MB)
    * maxMem: Memoria máxima asignada al juego (en MB)
*/
const getArgs = (args) => {  
  return {
    "logPath": args[0] || path.join(__dirname, 'app.log'),
    "gameDir": args[1] || path.join(__dirname, 'minecraft'),
    "versionId": args[2] || "1.0",
    "username": args[3] || "default",
    "minMem": args[4] || "1G",
    "maxMem": args[5] || "2G"
  }
}

// async function downloadFile(url, outputPath) {
//   const res = await fetch(url);
//   if (!res.ok) throw new Error("Error descargando archivo");

//   const arrayBuffer = await res.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
//   await fs.promises.writeFile(outputPath, buffer);
// }

/**
 * Descarga un archivo desde una URL
 * @param {string} url - URL del archivo
 * @param {string} destination - Ruta de destino
 * @returns {Promise<void>}
 */
async function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    let fileWriteError = null;

    file.on('error', (error) => {
      fileWriteError = error;
      file.close();
      try { fs.unlinkSync(destination); } catch (e) { }
      reject(new Error(`Error de escritura de archivo: ${error.message}`));
    });

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Seguir redirecciones
        file.close();
        try { fs.unlinkSync(destination); } catch (e) { }
        return this.downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destination); } catch (e) { }
        reject(new Error(`Error al descargar: HTTP ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`\r📥 Descargando: ${progress}%`);
      });

      response.on('error', (error) => {
        file.close();
        try { fs.unlinkSync(destination); } catch (e) { }
        reject(new Error(`Error en respuesta HTTP: ${error.message}`));
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close((err) => {
          if (err || fileWriteError) {
            try { fs.unlinkSync(destination); } catch (e) { }
            reject(err || fileWriteError);
          } else {
            console.log("\n✅ Descarga completada");

            // Verificar que el archivo se escribió correctamente
            if (!fs.existsSync(destination)) {
              reject(new Error("El archivo no se guardó correctamente"));
            } else {
              const stats = fs.statSync(destination);
              console.log(`📦 Tamaño del archivo descargado: ${stats.size} bytes`);
              resolve();
            }
          }
        });
      });

    }).on('error', (error) => {
      file.close();
      try { fs.unlinkSync(destination); } catch (e) { }
      reject(new Error(`Error de conexión HTTPS: ${error.message || error.code || 'Desconocido'}`));
    });
  });
}

/**
 * Verifica el checksum SHA256 de un archivo
 * @param {string} filePath - Ruta del archivo
 * @param {string} expectedHash - Hash esperado
 * @returns {Promise<boolean>}
 */
async function verifyChecksum(filePath, expectedHash) {
  return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => {
          const fileHash = hash.digest('hex');
          resolve(fileHash === expectedHash);
      });
      stream.on('error', reject);
  });
}

const handleProgress = (t) => {
  if (!t.total) return;
  let lastPrinted = 0;

  const percent = Math.floor((t.progress / t.total) * 100);

  if (percent >= lastPrinted + 10) {
    lastPrinted = percent - (percent % 10);
    if (process.send) process.send({
      type: 'progress',
      percent: lastPrinted
    });
    console.log(lastPrinted);
  }
}

const getOptions = (mc_path, versionId, username, javaPath="/usr/bin/java", minMem=2048, maxMem=4096) => {
  return {
      gamePath: mc_path,
      version: versionId,
      javaPath: javaPath,
      minMemory: minMem,
      maxMemory: maxMem,
      authorization: {
        accessToken: "0",
        clientToken: "0",
        uuid: "00000000-0000-0000-0000-000000000000",
        name: username,
        userType: "mojang"
      }
    }
};

const getJavaPath = () =>
  new Promise((res, rej) =>
    exec(os.platform() === "win32" ? "where java" : "which java",
      (e, out) => e || !out
        ? rej(new Error("Java no encontrado"))
        : res(out.split("\n")[0].trim())
    )
  );

// export { Log, getArgs, handleProgress, getOptions, getJavaPath, downloadFile, release_versions_url }

module.exports = { Log, getArgs, handleProgress, getOptions, getJavaPath, downloadFile, verifyChecksum, release_versions_url }