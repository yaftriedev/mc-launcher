const { MinecraftCore } = require('./MinecraftCore')
const { launch } = require('@xmcl/core')

class MinecraftRelease extends MinecraftCore {
    
  async install() {
    await this.installReleaseVersion()
  }

  /**
   * Lanza el juego usando la configuración almacenada en la clase.
   * @param {string} this.gameDir - Carpeta principal del juego. Aquí están versiones, librerías, assets, etc.
   * @param {string} this.versionId - Identificador de la versión que se quiere ejecutar.
   * @param {string} this.javaPath - Ruta al ejecutable de Java que iniciará el juego.
   * @param {string} this.username - Nombre del jugador que aparecerá dentro del juego.
   * @param {function(Buffer)} onData - Se ejecuta cuando el juego envía información por stdout (logs normales).
   * @param {function(Buffer)} onError - Se ejecuta cuando el juego envía errores por stderr.
   * @param {function(number)} onClose - Se ejecuta cuando el proceso de Minecraft se cierra.
   */
  async launch() {
    try {
      const proc = await launch({
        gamePath: this.gameDir,
        version: this.versionId,
        javaPath: this.javaPath,
        // minMemory: minMemory,
        // maxMemory: maxMemory,
        authorization: {
          accessToken: "0",
          clientToken: "0",
          uuid: "00000000-0000-0000-0000-000000000000",
          name: this.username,
          userType: "mojang"
        }
      })

      proc.stdout.on('data', d => this.log(d.toString()))
      proc.stderr.on('data', d => this.log(d.toString()))
      proc.on('close', code => {
        this.log(`Juego cerrado con código ${code}`)
        this.log("MC Closed")
      })
    }

    catch (err) { this.log(err) }
  }
}

module.exports = { MinecraftRelease }