const fs = require('fs');
const path = require('path');

function guardar(data, path) {
  fs.writeFileSync(path, JSON.stringify(data));
  console.log("Datos guardados en:", path);
}

function leer(path) {
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path));
}

module.exports = { guardar, leer };