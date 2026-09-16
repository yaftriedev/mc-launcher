#!/bin/bash

set -e

echo "==> Comprobando versiones..."

wine --version
rpm --version
dpkg --version

echo "==> Instalando dependencias de Node..."

npm install

echo "==> Generando renderer..."

npm run build-react

echo "==> Comprobando renderer..."

if [ ! -f "renderer-dist/index.html" ]; then
    echo "ERROR: No se ha generado renderer-dist/index.html"
    exit 1
fi

echo "==> Generando paquetes Electron..."

npx electron-builder \
    --linux AppImage \
    --win portable

echo
echo "==> Build completado."
echo "==> Archivos generados en: ./dist/"