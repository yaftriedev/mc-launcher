const { ipcMain } = require('electron');
const fs = require('fs').promises;
const { dataFilePath } = require('./../util/const');
const { save, load } = require('./../util/file');

// Funcion para inicializar el archivo de almacenamiento
async function initStorage() {
  const initialData = {
    name: "",
    instances: []
  };

  try {
    await fs.access(dataFilePath);
    return { success: true, message: "Already exists" };
  } catch {
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(initialData, null, 2),
      'utf-8'
    );
    return { success: true, message: "Created" };
  }
}

// Handler para IPC que expone las funciones de almacenamiento a la capa de renderizado
function storageHandler() {  
  // save file
  ipcMain.handle('save-data', async (event, { data }) => {
    return await save(data, dataFilePath);
  });

  // load file
  ipcMain.handle('load-data', async (event) => {
    return await load(dataFilePath);
  });


  // save name
  ipcMain.handle('save-name', async (event, { name }) => {
    try {
      const currentData = await load(dataFilePath);
      if (!currentData.success) return { success: false, error: currentData.error };
      currentData.data.name = name;
      const saveResult = await save(currentData.data, dataFilePath);
      if (!saveResult.success) return { success: false, error: saveResult.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // load name
  ipcMain.handle('load-name', async (event) => {
    const currentData = await load(dataFilePath);
    if (!currentData.success) return { success: false, error: currentData.error };
    return currentData?.data?.name || "Steve";
  });


  // save instances
  ipcMain.handle('save-instances', async (event, { instances }) => {
    try {
      const currentData = await load(dataFilePath);
      if (!currentData.success) return { success: false, error: currentData.error };
      currentData.data.instances = instances;
      const saveResult = await save(currentData.data, dataFilePath);
      if (!saveResult.success) return { success: false, error: saveResult.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // load instances
  ipcMain.handle('load-instances', async (event) => {
    const currentData = await load(dataFilePath);
    if (!currentData.success) return { success: false, error: currentData.error };
    return currentData?.data?.instances || {};
  });
}

module.exports = { initStorage, storageHandler };