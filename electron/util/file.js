const fs = require('fs').promises;

async function save(data, filePath) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function load(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { save, load };