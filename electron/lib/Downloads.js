const fs = require('fs');
const https = require("https");
const crypto = require('crypto');

/**
 * Descarga un archivo desde una URL
 * @param {string} url - URL del archivo
 * @param {string} destination - Ruta de destino
 * @returns {Promise<void>}
 */
async function downloadFile(url, destination, log = (d) => {}, retries = 3) {

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {

        log(`[DOWNLOAD] Intento ${attempt}/${retries} | Destino: ${destination}`);

        const file = fs.createWriteStream(destination);
        let fileWriteError = null;

        file.on('error', (error) => {
          log(`[DOWNLOAD] Error de escritura: ${error.message} | Código: ${error.code || 'N/A'}`);

          fileWriteError = error;
          file.close();

          try { fs.unlinkSync(destination); } catch (e) {}

          reject(error);
        });

        https.get(url, (response) => {

          if (response.statusCode === 302 || response.statusCode === 301) {
            const redirectUrl = response.headers.location;

            log(`[DOWNLOAD] Redirección: ${url} -> ${redirectUrl}`);

            file.close();
            try { fs.unlinkSync(destination); } catch (e) {}

            return this.downloadFile(
              redirectUrl,
              destination,
              log,
              retries
            )
              .then(resolve)
              .catch(reject);
          }

          if (response.statusCode !== 200) {
            log(`[DOWNLOAD] Error HTTP ${response.statusCode} | URL: ${url}`);

            file.close();
            try { fs.unlinkSync(destination); } catch (e) {}

            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }

          response.on('error', (error) => {
            log(`[DOWNLOAD] Error en respuesta HTTP: ${error.message} | Código: ${error.code || 'N/A'}`);

            file.close();
            try { fs.unlinkSync(destination); } catch (e) {}

            reject(error);
          });

          response.pipe(file);

          file.on('finish', () => {
            log(`[DOWNLOAD] Descarga recibida, cerrando archivo...`);

            file.close((err) => {

              if (err || fileWriteError) {
                const error = err || fileWriteError;

                log(`[DOWNLOAD] Error al cerrar/escribir archivo: ${error.message} | Código: ${error.code || 'N/A'}`);

                try { fs.unlinkSync(destination); } catch (e) {}

                reject(error);
                return;
              }

              if (!fs.existsSync(destination)) {
                const error = new Error("El archivo no se guardó correctamente");

                log(`[DOWNLOAD] Error: ${error.message}`);

                reject(error);
                return;
              }

              const size = fs.statSync(destination).size;

              log(`[DOWNLOAD] Descarga completada | Archivo: ${destination} | Tamaño: ${size} bytes`);

              resolve();
            });
          });

        }).on('error', (error) => {
          log(`[DOWNLOAD] Error HTTPS: ${error.message || 'Desconocido'} | Código: ${error.code || 'N/A'}`);

          file.close();
          try { fs.unlinkSync(destination); } catch (e) {}

          reject(error);
        });
      });

    } catch (err) {

      log(`[DOWNLOAD] Falló el intento ${attempt}/${retries} | Error: ${err.message} | Código: ${err.code || 'N/A'}`);

      if (attempt === retries) {
        log(`[DOWNLOAD] Se agotaron los reintentos`);
        throw err;
      }

      log(`[DOWNLOAD] Reintentando descarga (${attempt + 1}/${retries})...`);
    }
  }
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