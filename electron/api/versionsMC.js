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
        type: v.type, 
        url: v.url
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
      url: ""
    }));

}

async function fetchVersionsAll() {
  const releaseVersions = await fetchReleaseVersions();
  const forgeVersions = await fetchForgeVersions();
  
  const allVersions = [...releaseVersions, ...forgeVersions];
  
  // Elimina duplicados
  const seen = new Set();
  const uniqueVersions = allVersions
    .filter(item => item?.id && typeof item.id === "string")
    .filter(item => {
      const key = `${item.type}|${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return uniqueVersions.sort((a, b) => {
    
    // 2. Extraer la parte antes del guion
    const idA = a.id.split("-")[0];
    const idB = b.id.split("-")[0];

    // 3. Comparar x.x.x numéricamente
    const partsA = idA.split(".").map(Number);
    const partsB = idB.split(".").map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] ?? 0;
      const numB = partsB[i] ?? 0;

      if (numA !== numB) {
        return numB - numA;
      }
    }

    // 1. Ordenar por prioridad del type
    const priority = ["release", "forge", "other"];
    const prioA = priority.indexOf(a.type);
    const prioB = priority.indexOf(b.type);

    if (prioA !== prioB) {
      return prioB - prioA;
    }

    return 0;
  });
};

module.exports = { fetchReleaseVersions, fetchForgeVersions, fetchVersionsAll };