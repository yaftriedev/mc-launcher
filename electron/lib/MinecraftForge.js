//   /**
//    * Descarga el instalador de Forge correspondiente a una versión específica de Minecraft y ejecuta el instalador en el directorio del juego.
//    * @param {string|undefined} this.gameDir - Directorio donde está instalado Minecraft y donde se ejecutará la instalación.
//    * @param {string|undefined} this.versionId - Identificador de versión en formato similar a:
//    * `"forge-<mcVersion>-<forgeVersion>"`. Se usa para extraer la versión de Minecraft y de Forge.
//    */
//   async #installForgeVersion() {
//     try {
      
//       const mcVersion = this.versionId.split("-")[0];
//       const forgeVersion = this.versionId.split("-")[2];

//       const url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${forgeVersion}/forge-${mcVersion}-${forgeVersion}-installer.jar`
      
//       const outputPath = path.join(
//         this.gameDir, "installer",
//         `forge-${mcVersion}-${forgeVersion}-installer.jar`
//       );

//       console.log("Descargando...");
//       await downloadFile(url, outputPath);

//       console.log("Descarga completada:");
//       console.log(outputPath);

//       const child = spawn('java', [
//         '-jar',
//         outputPath,
//         '--installClient',
//         this.gameDir
//       ], {
//         stdio: 'inherit',
//         env: process.env
//       });

//     } catch (err) {
//       console.error("Error:", err.message);
//     }
//   }