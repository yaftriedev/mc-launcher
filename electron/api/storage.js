const { ipcMain, app } = require('electron');
const fs = require('fs').promises;
const path = require('path');

// Ruta base de la app empaquetada
const appPath = app.isPackaged
  ? path.join(process.resourcesPath, 'app')  // ruta de app.asar + carpeta app
  : process.cwd();                           // en desarrollo, la raíz del proyecto

const filePath = path.join(appPath, 'data.json');

// Funcion para inicializar el archivo de almacenamiento
async function initStorage() {
  const initialData = {
    name: "",
    instances: []
  };

  try {
    await fs.access(filePath);
    return { success: true, message: "Already exists" };
  } catch {
    await fs.writeFile(
      filePath,
      JSON.stringify(initialData, null, 2),
      'utf-8'
    );
    return { success: true, message: "Created" };
  }
}

// Función para manejar las operaciones de almacenamiento
async function save(data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function load() {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Handler para IPC que expone las funciones de almacenamiento a la capa de renderizado
function storageHandler(data, path) {  
  // save file
  ipcMain.handle('save-data', async (event, { data }) => {
    return await save(data);
  });

  // load file
  ipcMain.handle('load-data', async (event) => {
    return await load();
  });


  // save name
  ipcMain.handle('save-name', async (event, { name }) => {
    try {
      const currentData = await load();
      if (!currentData.success) return { success: false, error: currentData.error };
      currentData.data.name = name;
      const saveResult = await save(currentData.data);
      if (!saveResult.success) return { success: false, error: saveResult.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // load name
  ipcMain.handle('load-name', async (event) => {
    const currentData = await load();
    if (!currentData.success) return { success: false, error: currentData.error };
    return currentData?.data?.name || "Steve";
  });


  // save instances
  ipcMain.handle('save-instances', async (event, { instances }) => {
    try {
      const currentData = await load();
      if (!currentData.success) return { success: false, error: currentData.error };
      currentData.data.instances = instances;
      const saveResult = await save(currentData.data);
      if (!saveResult.success) return { success: false, error: saveResult.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // load instances
  ipcMain.handle('load-instances', async (event) => {
    const currentData = await load();
    if (!currentData.success) return { success: false, error: currentData.error };
    return currentData?.data?.instances || {};
  });
}

module.exports = { initStorage, storageHandler };