const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const startPack = require('./webpack-build');

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default async function excludeUselessScriptsInIntlMiniProgram(projectDir) {
  return startPack({
    platform: 'ali',
    appEntry: '',
    sourceRoot: projectDir,
    outputRoot: projectDir + '2',
    webpack(conf) {
      conf.plugins.unshift(new FriendlyErrorsWebpackPlugin());
      return conf;
    },
  });
}
