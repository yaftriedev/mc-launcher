const release_versions_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
const forge_promotions_url = "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json";

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

const getVersions = () => fetchReleaseVersions()

module.exports = { getVersions }