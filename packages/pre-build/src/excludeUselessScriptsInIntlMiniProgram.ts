import webpackBuild from './webpack-build';

export interface ExcludeUselessScriptsInIntlMiniProgramOptions {
  analyze?: boolean;
}

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default async function excludeUselessScriptsInIntlMiniProgram(
  projectDir: string,
  options?: ExcludeUselessScriptsInIntlMiniProgramOptions,
) {
  const result = await webpackBuild({ ...options, projectDir });
  return {
    distDir: result?.stats[0]?.compilation.outputOptions.path,
  };
}
