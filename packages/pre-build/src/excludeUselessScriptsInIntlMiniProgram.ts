import webpackBuild from './webpack-build';

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default async function excludeUselessScriptsInIntlMiniProgram(projectDir: string) {
  const result = await webpackBuild({ projectDir });
  return {
    distDir: result?.stats[0]?.compilation.outputOptions.path,
  };
}
