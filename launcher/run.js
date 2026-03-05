// import { launch } from '@xmcl/core'
// import { Log, getArgs, getJavaPath } from './util.js'

const { launch } = require('@xmcl/core')
const { Log, getArgs, getJavaPath } = require('./util.js')

async function run({
  logPath=undefined, 
  gameDir=undefined, 
  versionId=undefined, 
  username=undefined,
  minMemory=2048, 
  maxMemory=4096
}) {
  const log = new Log(logPath);
  const javaPath = await getJavaPath();

  log(" Starting MC ")
  
  try {
    const proc = await launch({
      gamePath: gameDir,
      version: versionId,
      javaPath: javaPath, // ruta a tu java
      minMemory: minMemory,
      maxMemory: maxMemory,
      authorization: {
        accessToken: "0",
        clientToken: "0",
        uuid: "00000000-0000-0000-0000-000000000000",
        name: username,
        userType: "mojang"
      }
    })

    proc.stdout.on('data', data => log(data.toString()))
    proc.stderr.on('data', data => log(data.toString()))
    proc.on('close', code => log(`Juego cerrado con código ${code}`))
  } catch (err) {
    log(`Error lanzando el juego: ${err.message}`);
  }
}

// const args = getArgs(process.argv.slice(2))

const args = {
  "logPath":"C:/Users/Yaftrie/Documents/mc-launcher/app.log", 
  "gameDir":"C:/Users/Yaftrie/Documents/mc-launcher/instances/hola", 
  "versionId":"1.21.11", 
  "username":"hello",
}

run(args);
