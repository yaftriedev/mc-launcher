
const handleProgress = (t) => {
  if (!t.total) return;
  let lastPrinted = 0;

  const percent = Math.floor((t.progress / t.total) * 100);

  if (percent >= lastPrinted + 10) {
    lastPrinted = percent - (percent % 10);
    if (process.send) process.send({
      type: 'progress',
      percent: lastPrinted
    });
    console.log(lastPrinted);
  }
}

const getOptions = (mc_path, versionId, username) => {
  return {
      gamePath: mc_path,
      version: versionId,
      javaPath: "java", // Asegúrate que Java esté en PATH
      // minMemory: minMem, // ej: 1024
      // maxMemory: maxMem, // ej: 4096
      authorization: {
        accessToken: "0",
        clientToken: "0",
        uuid: "00000000-0000-0000-0000-000000000000",
        name: username,
        userType: "mojang"
      }
    }
};

module.exports = {
  getOptions,
  handleProgress
};