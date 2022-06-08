import path from 'path';
import fs from 'fs-extra';
import ensurePath from './ensurePath';

/**
 * Find the pages for mini-program.
 *
 * @param {string} projectDir
 */
export default function findPages(projectDir: string) {
  const configFilePath = path.resolve(projectDir, 'app.json');
  const appJson: { pages?: string[] } = fs.readJsonSync(configFilePath);
  return (appJson.pages || []).map(page => {
    return {
      configPath: page,
      configFilePath,
      jsPath: path.resolve(projectDir, `${page}.js`),
      axmlPath: path.resolve(projectDir, `${page}.axml`),
      acssPath: ensurePath(path.resolve(projectDir, `${page}.acss`)),
      jsonPath: ensurePath(path.resolve(projectDir, `${page}.json`)),
    };
  });
}
