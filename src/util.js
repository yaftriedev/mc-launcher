export const getInfo = async () => await window.api.getInfo();
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

export const saveName = async (name) => await window.api.saveName(name);
export const loadName = async () => await window.api.loadName();

export const saveInstances = async (instances) => await window.api.saveInstances(instances);
export const loadInstances = async () => await window.api.loadInstances();

export const getVersionsRelease = async () => await window.api.getVersionsRelease();

export const capFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const versionToText = (version) => {
  if (!version) return "Desconocida";
  return capFirstLetter(version.type) + " " + version.id;
}

export const LaunchInstance = async (instancia) => {
  console.log("Lanzando instancia:", instancia);
  
  const options = {
    name: instancia.name, // Ejemplo de ruta
    version: instancia.version.id, // Usar la versión de la instancia
    username: await loadName() // Aquí podrías usar un nombre de usuario dinámico si lo deseas
  };

  window.api.launchInstance(options);
}