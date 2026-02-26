const { Launch } = require('minecraft-java-core');
const path = require('path');
const fs = require('fs');

// Usage: launch.js [log_path] [mc_path] [versionId] [username] [minMem] [maxMem]
args = process.argv.slice(2);

const logPath = args[0] || path.join(__dirname, 'app.log');
const mc_path = args[1] || path.join(__dirname, 'minecraft');
const versionId = args[2] || "1.0";
const username = args[3] || "default";
const minMem = args[4] || "1G";
const maxMem = args[5] || "2G";

// Function to write logs to file
function writeLog(message) {
  fs.appendFile(logPath, message, (err) => {
    if (err) throw err;
  });
}

// create launcher instance
const launcher = new Launch();

let lastSent = -1;

launcher.on('progress', (progress, size, element) => {
  const percent = Math.floor((progress / size) * 100);

  // bloque actual (0,10,20,...100)
  const currentBlock = Math.floor(percent / 10) * 10;

  if (currentBlock !== lastSent && currentBlock % 10 === 0) {
    lastSent = currentBlock;

    if (process.send) {
      writeLog(`Progress: ${currentBlock}% - ${element}\n`);
      process.send({
        type: 'progress',
        percent: currentBlock,
        element
      });
    }
  }
});

launcher.on('data', (data) => writeLog(data));
launcher.on('error', (data) => writeLog(`Error: ${data}`));
launcher.on('close', () => writeLog(`Launch Closed at ${new Date().toISOString()}`));

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