const { ipcMain } = require('electron');
const fs = require('fs').promises;
const { dataFilePath } = require('./../util/const');
const { save, load } = require('./../util/file');

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

async function saveName(name) {
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
}

async function loadName() {
  const currentData = await load(dataFilePath);
  if (!currentData.success) return { success: false, error: currentData.error };
  return currentData?.data?.name || "Steve";
}

async function saveInstances(instances) {
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
}

async function loadInstances() {
  const currentData = await load(dataFilePath);
  if (!currentData.success) return { success: false, error: currentData.error };
  return currentData?.data?.instances || {};
}

module.exports = { saveName, loadName, saveInstances, loadInstances, initStorage };