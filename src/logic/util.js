
export const getInfo = async () => await window.data.getInfo();
export const getMSGInfo = async () => {
  const info = await getInfo();
  return `
    MC yLauncher\n
    Versión: ${info.version}
    Autor: ${info.author}
    Repositorio: ${info.repo}
    Ruta de datos: ${info.userDataPath}
    `;
}

export const saveName = async (name) => await window.data.saveName(name);
export const loadName = async () => await window.data.loadName();

export const saveInstances = async (instances) => await window.data.saveInstances(instances);
export const loadInstances = async () => await window.data.loadInstances();

export const getVersionsRelease = async () => await window.versions.getVersionsRelease();

export const capFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const versionToText = (version) => {
  if (!version) return "Desconocida";
  return capFirstLetter(version.type) + " " + version.id;
}