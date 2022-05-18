const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default async function excludeUselessScriptsInIntlMiniProgram(projectDir) {
  const webpackConfig = {
    context: projectDir,
    entry: './app.js',
    output: {
      path: projectDir,
      filename: '[name].bundle.js',
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      // TODO: add the common chunk plugin.
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'common',
        minChunks: 2,
        minSize: 0,
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
  };

  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        reject(error || stats);
      } else {
        resolve(stats);
      }
    });
  });
}
