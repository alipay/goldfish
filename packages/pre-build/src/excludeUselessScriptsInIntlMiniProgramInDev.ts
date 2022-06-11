import * as path from 'path';
import { cpDepFileWithPkgJson } from './excludeUselessScriptsInIntlMiniProgram';
import EntriesWatcher from './findMiniDependencies/EntriesWatcher';
import { log } from './utils';

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default function excludeUselessScriptsInIntlMiniProgramInDev(projectDir: string) {
  const nodeModulesDir = path.resolve(projectDir, 'node_modules');
  const entriesWatcher = new EntriesWatcher(projectDir);
  entriesWatcher.onChange(({ deps, pages, components, sjsList, changedFile }) => {
    log(`Start coping files because the file changed: ${changedFile}.`);
    deps.forEach(dep => {
      if (dep.importFilePath.startsWith(nodeModulesDir)) {
        return;
      }
      cpDepFileWithPkgJson(projectDir, dep.importFilePath, nodeModulesDir);
    });
    pages?.forEach(page => {
      if (page.jsPath.startsWith(nodeModulesDir)) {
        return;
      }
      cpDepFileWithPkgJson(projectDir, page.jsPath, nodeModulesDir);
      page.acssPath && cpDepFileWithPkgJson(projectDir, page.acssPath, nodeModulesDir);
      page.jsonPath && cpDepFileWithPkgJson(projectDir, page.jsonPath, nodeModulesDir);
      page.axmlPath && cpDepFileWithPkgJson(projectDir, page.axmlPath, nodeModulesDir);
    });
    components?.forEach(component => {
      if (component.jsPath.startsWith(nodeModulesDir)) {
        return;
      }
      component.acssPath && cpDepFileWithPkgJson(projectDir, component.acssPath, nodeModulesDir);
      cpDepFileWithPkgJson(projectDir, component.axmlPath, nodeModulesDir);
      cpDepFileWithPkgJson(projectDir, component.jsPath, nodeModulesDir);
      cpDepFileWithPkgJson(projectDir, component.jsonPath, nodeModulesDir);
    });
    sjsList?.forEach(sjs => {
      if (sjs.sjsPath.startsWith(nodeModulesDir)) {
        return;
      }
      cpDepFileWithPkgJson(projectDir, sjs.sjsPath, nodeModulesDir);
    });
    log(`Successfully copy files.`);
  });
}
