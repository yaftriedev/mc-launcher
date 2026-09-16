#!/bin/bash
set -e

echo "Paso 1"
npm install

echo "Paso 2"
npm run dist

echo "Listo"