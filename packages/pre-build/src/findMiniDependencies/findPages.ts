import * as path from 'path';
import * as fs from 'fs-extra';
import ensurePath from './ensurePath';
import fileCache from './fileCache';
import lodash from 'lodash'

type AppConfig = {
  pages?: string[];
  subPackages?: {
    root: string
    pages: string[]
  }[]
}

/**
 * Find the pages for mini-program.
 *
 * @param {string} projectDir
 */
export default function findPages(projectDir: string) {
  const configFilePath = path.resolve(projectDir, 'app.json');
  return fileCache.run('findPages', configFilePath, () => {
    const { pages = [], subPackages = [] }: AppConfig = fs.readJsonSync(configFilePath);
    const allPages = lodash.concat(pages, lodash.flatten(subPackages.map(sub => sub.pages.map(page => `${sub.root}/${page}`))))

    return allPages.map(page => {
      const filePrefix = path.resolve(projectDir, page);

      return {
        configPath: page,
        configFilePath,
        jsPath: ensurePath(filePrefix, ['.js', '.ts']) as string,
        axmlPath: path.resolve(projectDir, `${page}.axml`),
        acssPath: ensurePath(filePrefix, ['.acss', '.less']),
        jsonPath: ensurePath(path.resolve(projectDir, `${page}.json`)),
      };
    });
  });
}
