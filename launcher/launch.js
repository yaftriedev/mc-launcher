const { Launch } = require('minecraft-java-core');
const path = require('path');

// Usage: launch.js [path] [versionId] [username] [minMem] [maxMem]
args = process.argv.slice(2);

const mc_path = args[0] || path.join(__dirname, 'minecraft');
const versionId = args[1] || "1.0";
const username = args[2] || "default";
const minMem = args[3] || "1G";
const maxMem = args[4] || "2G";

// create launcher instance
const launcher = new Launch();

// add event listeners
launcher.on('progress', (progress, size, element) => {
  console.log(`${element} -> ${(progress/size*100).toFixed(2)}%`);
});
launcher.on('data', console.log);
launcher.on('error', console.error);
launcher.on('close', () => console.log('Descarga/Inicio terminado'));

// Define options
const options = {
  path: mc_path,
  version: versionId,
  authenticator: {
    meta: { type: "offline" },
    access_token: "",
    client_token: "",
    uuid: username,
    name: username,
    user_properties: "{}"
  },
  memory: { 
    min: minMem, 
    max: maxMem 
  },
  verify: true,
  downloadFileMultiple: 10
};

// launch the game
launcher.Launch(options);