const { release_versions_url } = require('./../util/const');

async function fetchReleaseVersions() {
  try {
    const response = await fetch(release_versions_url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const manifest = await response.json();

    const releaseVersions = manifest.versions
      .filter(v => v.type === "release")
      .map(v => ({
        id: v.id,
        type: v.type
      }));

    return releaseVersions;
    
  } catch (error) {
    console.error("Error al obtener versiones:", error);
    return ["Error al obtener versiones"];
  }
}

async function fetchForgeVersions() {
  const res = await fetch(forge_promotions_url);
  
  if (!res.ok) throw new Error("Error obteniendo versiones Forge");

  const data = await res.json();

  return Object.entries(data.promos)
    .map(([key, value]) => ({ 
      id: key.split("-")[0] + "-forge-" + value, 
      type: "forge", 
    }));

}

async function fetchVersionsAll() {
  const releaseVersions = await fetchReleaseVersions();
  const forgeVersions = await fetchForgeVersions();
  
  return [...releaseVersions, ...forgeVersions];
}

module.exports = { fetchReleaseVersions, fetchForgeVersions, fetchVersionsAll };