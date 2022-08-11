import * as path from 'path';
import lodash from 'lodash';
import { cpDepFileWithPkgJson } from './excludeUselessScriptsInIntlMiniProgram';
import EntriesWatcher from './findMiniDependencies/EntriesWatcher';
import fileCache from './findMiniDependencies/fileCache';
import { log } from './utils';

export interface ExcludeUselessScriptsInIntlMiniProgramInDevOptions {
  log?: {
    info?: (message: string) => void;
  };
  beforeCopy?(): void | Promise<void>;
  afterCopy?(): void | Promise<void>;
}

const defaultOptions: ExcludeUselessScriptsInIntlMiniProgramInDevOptions = {
  log: {
    info(message) {
      log(message);
    },
  },
};

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default function excludeUselessScriptsInIntlMiniProgramInDev(
  projectDir: string,
  options?: ExcludeUselessScriptsInIntlMiniProgramInDevOptions,
) {
  const finalOptions = lodash.merge(options || {}, defaultOptions);

  fileCache.clear();
  const nodeModulesDir = path.resolve(projectDir, 'node_modules');
  const entriesWatcher = new EntriesWatcher(projectDir);
  entriesWatcher.onChange(async ({ deps, pages, components, sjsList, changedFile }) => {
    finalOptions.log?.info?.(`Start coping files because the file changed: ${changedFile}.`);
    await options?.beforeCopy?.();
    deps.forEach(dep => {
      if (dep.importFilePath.startsWith(nodeModulesDir)) {
        return;
      }
      cpDepFileWithPkgJson(projectDir, dep.importFilePath, nodeModulesDir, finalOptions);
    });
    pages?.forEach(page => {
      if (page.jsPath.startsWith(nodeModulesDir)) {
        return;
      }
      cpDepFileWithPkgJson(projectDir, page.jsPath, nodeModulesDir, finalOptions);
      page.acssPath && cpDepFileWithPkgJson(projectDir, page.acssPath, nodeModulesDir, finalOptions);
      page.jsonPath && cpDepFileWithPkgJson(projectDir, page.jsonPath, nodeModulesDir, finalOptions);
      page.axmlPath && cpDepFileWithPkgJson(projectDir, page.axmlPath, nodeModulesDir, finalOptions);
    });
    components?.forEach(component => {
      if (component.jsPath.startsWith(nodeModulesDir)) {
        return;
      }
      component.acssPath && cpDepFileWithPkgJson(projectDir, component.acssPath, nodeModulesDir, finalOptions);
      cpDepFileWithPkgJson(projectDir, component.axmlPath, nodeModulesDir, finalOptions);
      cpDepFileWithPkgJson(projectDir, component.jsPath, nodeModulesDir, finalOptions);
      cpDepFileWithPkgJson(projectDir, component.jsonPath, nodeModulesDir, finalOptions);
    });
    sjsList?.forEach(sjs => {
      if (sjs.sjsPath.startsWith(nodeModulesDir)) {
        return;
      }
      cpDepFileWithPkgJson(projectDir, sjs.sjsPath, nodeModulesDir, finalOptions);
    });
    await options?.afterCopy?.();
    finalOptions.log?.info?.(`Successfully copy files.`);
  });
}
