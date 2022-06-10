import path from 'path';
import fs from 'fs-extra';
import findMiniDependencies from './findMiniDependencies';
import fileCache from './findMiniDependencies/fileCache';
import { log } from './utils';

export function findPackageJson(dir: string): string | undefined {
  const checkPath = path.resolve(dir, 'package.json');
  if (fs.existsSync(checkPath)) {
    return checkPath;
  }

  const nextDir = path.dirname(dir);
  if (nextDir === dir) {
    return;
  }
  return findPackageJson(nextDir);
}

/**
 * projectDir: /a/b/c/d
 * sourcePath: /a/b/node_modules/e/node_modules/f/g.js
 * result: node_modules/e/node_modules/f/g.js
 *
 * @param {string} projectDir
 * @param {string} sourcePath
 */
export function findRelativePath(projectDir: string, sourcePath: string): string | undefined {
  if (sourcePath.startsWith(path.resolve(projectDir, 'node_modules'))) {
    return sourcePath.replace(`${projectDir}/`, '');
  }
  const dir = path.dirname(projectDir);
  if (dir === projectDir) {
    return;
  }
  return findRelativePath(dir, sourcePath);
}

export function cpDepFile(projectDir: string, depFilePath: string, newNodeModulesDir: string) {
  const relativePath = findRelativePath(projectDir, depFilePath);
  if (!relativePath) {
    throw new Error(
      `The dependency file \`${depFilePath}\` does not locate at the module resolve path: \`${projectDir}\`.`,
    );
  }
  fs.cpSync(depFilePath, path.resolve(newNodeModulesDir, relativePath.replace('node_modules/', '')), { force: true });
  log(`Copy file: ${depFilePath} -> ${newNodeModulesDir}.`);
}

export function cpDepFileWithPkgJson(projectDir: string, depFilePath: string, newNodeModulesDir: string) {
  // Only move the dependency under node_modules.
  if (!/\/node_modules\//.test(depFilePath)) {
    return;
  }

  fileCache.run('cpDepFileWithPkgJson', depFilePath, () => {
    cpDepFile(projectDir, depFilePath, newNodeModulesDir);
  });

  // Move the package.json
  const sourcePath = findPackageJson(path.dirname(depFilePath));
  if (sourcePath) {
    fileCache.run('cpDepFileWithPkgJson', sourcePath, () => {
      cpDepFile(projectDir, sourcePath, newNodeModulesDir);
    });
  }
}

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default function excludeUselessScriptsInIntlMiniProgram(projectDir: string) {
  const oldNodeModulesDir = path.resolve(projectDir, 'node_modules');
  const newNodeModulesDir = path.resolve(projectDir, 'node_modules_new');

  const { entries, entryDeps } = findMiniDependencies(projectDir);
  entryDeps.forEach(dep => {
    cpDepFileWithPkgJson(projectDir, dep.importFilePath, newNodeModulesDir);
  });
  entries.pages.forEach(page => {
    cpDepFileWithPkgJson(projectDir, page.jsPath, newNodeModulesDir);
    page.acssPath && cpDepFileWithPkgJson(projectDir, page.acssPath, newNodeModulesDir);
    page.jsonPath && cpDepFileWithPkgJson(projectDir, page.jsonPath, newNodeModulesDir);
    page.axmlPath && cpDepFileWithPkgJson(projectDir, page.axmlPath, newNodeModulesDir);
  });
  entries.components.forEach(component => {
    component.acssPath && cpDepFileWithPkgJson(projectDir, component.acssPath, newNodeModulesDir);
    cpDepFileWithPkgJson(projectDir, component.axmlPath, newNodeModulesDir);
    cpDepFileWithPkgJson(projectDir, component.jsPath, newNodeModulesDir);
    cpDepFileWithPkgJson(projectDir, component.jsonPath, newNodeModulesDir);
  });
  entries.sjsList.forEach(sjs => {
    cpDepFileWithPkgJson(projectDir, sjs.sjsPath, newNodeModulesDir);
  });

  // Remove the node_modules and use the new node_modules.
  fs.rmSync(oldNodeModulesDir, { force: true, recursive: true });
  fs.moveSync(newNodeModulesDir, oldNodeModulesDir);
}
