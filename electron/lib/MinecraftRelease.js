const { MinecraftCore } = require('./MinecraftCore')
const { launch } = require('@xmcl/core')
const fs = require("fs")

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
  // async launch() {
  //   try {
  //     const proc = await launch({
  //       gamePath: this.gameDir,
  //       version: this.versionId,
  //       javaPath: this.javaPath,
  //       // minMemory: minMemory,
  //       // maxMemory: maxMemory,
  //       authorization: {
  //         accessToken: "0",
  //         clientToken: "0",
  //         uuid: "00000000-0000-0000-0000-000000000000",
  //         name: this.username,
  //         userType: "mojang"
  //       }
  //     })

  //     proc.stdout.on('data', d => this.log(d.toString()))
  //     proc.stderr.on('data', d => this.log(d.toString()))
  //     proc.on('close', code => {
  //       this.log(`Juego cerrado con código ${code}`)
  //       this.log("MC Closed")
  //     })
  //   }

  //   catch (err) { this.log(err) }
  // }

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
    this.log("========================================")
    this.log("INICIANDO MINECRAFT")
    this.log("========================================")

    try {
      // Información del entorno
      this.log(`[ENV] platform: ${process.platform}`)
      this.log(`[ENV] arch: ${process.arch}`)
      this.log(`[ENV] electron: ${process.versions.electron}`)
      this.log(`[ENV] node: ${process.versions.node}`)

      // Configuración
      this.log(`[CONFIG] gameDir: ${this.gameDir}`)
      this.log(`[CONFIG] versionId: ${this.versionId}`)
      this.log(`[CONFIG] javaPath: ${this.javaPath}`)
      this.log(`[CONFIG] username: ${this.username}`)

      // Comprobar Java
      this.log("[JAVA] Comprobando Java...")

      try {
        if (fs.existsSync(this.javaPath)) { this.log(`[JAVA] Java encontrado: ${this.javaPath}`) } 
        else { this.log(`[JAVA] ADVERTENCIA: Java NO existe: ${this.javaPath}`) }
      } 
      
      catch (err) { this.log(`[JAVA] Error comprobando Java: ${err.stack || err}`) }

      // Comprobar gameDir
      this.log("[FILES] Comprobando gameDir...")

      if (fs.existsSync(this.gameDir)) { this.log(`[FILES] gameDir existe: ${this.gameDir}`) } 
      else { this.log(`[FILES] ERROR: gameDir NO existe: ${this.gameDir}`) }

      // Lanzamiento
      this.log("[XMCL] Llamando a @xmcl/core launch()...")

      const proc = await launch({
        gamePath: this.gameDir,
        version: this.versionId,
        javaPath: this.javaPath,

        authorization: {
          accessToken: "0",
          clientToken: "0",
          uuid: "00000000-0000-0000-0000-000000000000",
          name: this.username,
          userType: "mojang"
        }
      })

      this.log("[XMCL] launch() completado")
      this.log(`[XMCL] PID: ${proc.pid}`)

      // STDOUT
      proc.stdout?.on("data", d => this.log(`[MC STDOUT] ${d.toString()}`))

      // STDERR
      proc.stderr?.on("data", d => this.log(`[MC STDERR] ${d.toString()}`))

      // Error del proceso
      proc.on("error", err => {
        this.log("[MC PROCESS ERROR]")
        this.log(err.stack || err)
      })

      // Cierre
      proc.on("close", (code, signal) => {
        this.log(`[MC CLOSE] Código: ${code}, Signal: ${signal}`)
        this.log("MC Closed")
      })

      this.log("[XMCL] Listeners configurados")
    }

    catch (err) {
      this.log("========================================")
      this.log("ERROR AL LANZAR MINECRAFT")
      this.log("========================================")

      this.log(`Nombre: ${err?.name}`)
      this.log(`Mensaje: ${err?.message}`)
      this.log(`Stack:\n${err?.stack}`)

      // Si el error tiene propiedades adicionales
      try {
        this.log(
          `[ERROR OBJECT] ${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}`
        )
      } catch {
        this.log("[ERROR OBJECT] No se pudo serializar el error")
      }
    }
  
  }
}

module.exports = { MinecraftRelease }