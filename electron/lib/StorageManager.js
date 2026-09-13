const fs = require('fs').promises;

class StorageManager {
  
  /**
   * @param {string} filePath - ruta
   */
  constructor(filePath) {
    this.filePath = filePath;
  }

  async initStorage() {
    const initialData = {
      name: "",
      instances: []
    };

    try {
      await fs.access(this.filePath);
      return { success: true, message: "Already exists" };
    } catch {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(initialData, null, 2),
        'utf-8'
      );
      return { success: true, message: "Created" };
    }
  }

  /**
   * Guarda contenido en un archico
   * @param {string} data - Informacion para guardar
   * @param {string} this.filepath - ruta
   * @return {json} - {success, error}
  */
  async #save(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el contenido de un archivo
   * @param {string} this.filepath - ruta
   * @return {{success: boolean, data?, error?}}
   */
  async #load() {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      return { success: true, data: JSON.parse(content) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveName(name) {
    try {
      const currentData = await this.#load(this.filePath);
      if (!currentData.success) return { success: false, error: currentData.error };
      currentData.data.name = name;
      const saveResult = await this.#save(currentData.data, this.filePath);
      if (!saveResult.success) return { success: false, error: saveResult.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loadName() {
    const currentData = await this.#load(this.filePath);
    if (!currentData.success) return { success: false, error: currentData.error };
    return currentData?.data?.name || "Steve";
  }

  async saveInstances(instances) {
    try {
      const currentData = await this.#load(this.filePath);
      if (!currentData.success) return { success: false, error: currentData.error };
      currentData.data.instances = instances;
      const saveResult = await this.#save(currentData.data, this.filePath);
      if (!saveResult.success) return { success: false, error: saveResult.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loadInstances() {
    const currentData = await this.#load(this.filePath);
    if (!currentData.success) return { success: false, error: currentData.error };
    return currentData?.data?.instances || {};
  }

}

module.exports = { StorageManager };