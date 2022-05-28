const startPack = require("@goldfishjs/webpack-build");
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default async function excludeUselessScriptsInIntlMiniProgram(projectDir) {
  return startPack({
    isProduction: true,
    isWatch: false,
    config: {
      outputRoot: projectDir,
      webpack(conf) {
        conf.plugins.unshift(new FriendlyErrorsWebpackPlugin())
        return conf
      }      
    }
  })
}
