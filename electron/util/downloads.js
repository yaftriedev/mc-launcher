const fs = require('fs');
const https = require("https");
const crypto = require('crypto');

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
            // Verificar que el archivo se escribió correctamente
            if (!fs.existsSync(destination)) {
              reject(new Error("El archivo no se guardó correctamente"));
            } else {
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

module.exports = { downloadFile, verifyChecksum }