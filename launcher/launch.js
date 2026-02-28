const { MinecraftFolder , launch } = require("@xmcl/core");
const { getVersionList, install, installTask, installDependencies } = require("@xmcl/installer");
const { getOptions, handleProgress } = require("./util");
const path = require('path');
const fs = require('fs');

require('events').setMaxListeners(0)

// Usage: launch.js [log_path] [mc_path] [versionId] [username] [minMem] [maxMem]
args = process.argv.slice(2);

const logPath = args[0] || path.join(__dirname, 'app.log');
const mc_path = args[1] || path.join(__dirname, 'minecraft');
const versionId = args[2] || "1.0";
const username = args[3] || "default";
// const minMem = args[4] || "1G";
// const maxMem = args[5] || "2G";

// Logging setup
const logStream = fs.createWriteStream(logPath, { flags: "a" });
const log = (message) => { if (logStream.writableEnded) return; logStream.write(message);}

log(`\n=== Lanzamiento iniciado a las ${new Date().toISOString()} ===\n`);

// Función principal para lanzar Minecraft
async function launchMinecraft( mc_path, versionId, username ) { 

  try {

    // 2) Verificar si la versión existe
    const versionFolder = path.join(mc_path, "versions", versionId);
    
    const list = await getVersionList(); 
    const versionMeta = list.versions.find(v => v.id === versionId); 
    if (!versionMeta) throw new Error("Versión no encontrada");
    const mcDir = new MinecraftFolder(mc_path);

    if (!fs.existsSync(versionFolder)) {
      log(`Instalando versión ${versionId}...`);
      const versionTask = installTask(versionMeta, mcDir);
      await versionTask.startAndWait({ onUpdate: handleProgress });
      log(`Versión ${versionId} instalada correctamente.`);
    } else {
      log(`Versión ${versionId} ya instalada.`);
    }

    await installDependencies(await install(versionMeta, mcDir), mcDir);

    // 3) Lanzar Minecraft
    log("Lanzando Minecraft...");

    const proc = await launch(getOptions(mc_path, versionId, username));

    proc.stdout.on("data", d => log(d.toString()));
    proc.stderr.on("data", d => log(d.toString()));

    proc.on("close", code => {
      if (process.send) process.send({ type: 'mc-closed' });
      
      log(`Minecraft cerrado con código ${code}`);
      logStream.end();
    });

  } catch (err) {
    log(`ERROR: ${err.message}`);
    logStream.end();
    throw err;
  }
}

launchMinecraft(mc_path, versionId, username)
  .then(() => log("Proceso de lanzamiento finalizado."))
  .catch(err => log(`Error en el proceso de lanzamiento: ${err.message}`));