import * as path from 'path';
import * as fs from 'fs-extra';
import lodash from 'lodash';
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

export function cpDepFile(
  projectDir: string,
  depFilePath: string,
  newNodeModulesDir: string,
  options: ExcludeUselessScriptsInIntlMiniProgramOptions,
) {
  const relativePath = findRelativePath(projectDir, depFilePath);
  if (!relativePath) {
    throw new Error(
      `The dependency file \`${depFilePath}\` does not locate at the module resolve path: \`${projectDir}\`.`,
    );
  }
  fs.copySync(depFilePath, path.resolve(newNodeModulesDir, relativePath.replace('node_modules/', '')), {
    overwrite: true,
  });
  options.log?.info?.(`Copy file: ${depFilePath} -> ${newNodeModulesDir}.`);
}

export function cpDepFileWithPkgJson(
  projectDir: string,
  depFilePath: string,
  newNodeModulesDir: string,
  options: ExcludeUselessScriptsInIntlMiniProgramOptions,
) {
  // Only move the dependency under node_modules.
  if (!/\/node_modules\//.test(depFilePath)) {
    return;
  }

  fileCache.run('cpDepFileWithPkgJson', depFilePath, () => {
    cpDepFile(projectDir, depFilePath, newNodeModulesDir, options);
  });

  // Move the package.json
  const sourcePath = findPackageJson(path.dirname(depFilePath));
  if (sourcePath) {
    fileCache.run('cpDepFileWithPkgJson', sourcePath, () => {
      cpDepFile(projectDir, sourcePath, newNodeModulesDir, options);
    });
  }
}

export interface ExcludeUselessScriptsInIntlMiniProgramOptions {
  log?: {
    info?: (message: string) => void;
  };
}

const defaultOptions: ExcludeUselessScriptsInIntlMiniProgramOptions = {
  log: {
    info(message) {
      log(message);
    },
  },
};

export function copyFiles(projectDir: string, options?: ExcludeUselessScriptsInIntlMiniProgramOptions) {
  const finalOptions = lodash.merge(defaultOptions, options || {});

  const oldNodeModulesDir = path.resolve(projectDir, 'node_modules');
  const newNodeModulesDir = path.resolve(projectDir, 'node_modules_new');

  const { entries, entryDeps } = findMiniDependencies(projectDir);
  entryDeps.forEach(dep => {
    cpDepFileWithPkgJson(projectDir, dep.importFilePath, newNodeModulesDir, finalOptions);
  });
  entries.pages.forEach(page => {
    cpDepFileWithPkgJson(projectDir, page.jsPath, newNodeModulesDir, finalOptions);
    page.acssPath && cpDepFileWithPkgJson(projectDir, page.acssPath, newNodeModulesDir, finalOptions);
    page.jsonPath && cpDepFileWithPkgJson(projectDir, page.jsonPath, newNodeModulesDir, finalOptions);
    page.axmlPath && cpDepFileWithPkgJson(projectDir, page.axmlPath, newNodeModulesDir, finalOptions);
  });
  entries.components.forEach(component => {
    component.acssPath && cpDepFileWithPkgJson(projectDir, component.acssPath, newNodeModulesDir, finalOptions);
    cpDepFileWithPkgJson(projectDir, component.axmlPath, newNodeModulesDir, finalOptions);
    cpDepFileWithPkgJson(projectDir, component.jsPath, newNodeModulesDir, finalOptions);
    cpDepFileWithPkgJson(projectDir, component.jsonPath, newNodeModulesDir, finalOptions);
  });
  entries.sjsList.forEach(sjs => {
    cpDepFileWithPkgJson(projectDir, sjs.sjsPath, newNodeModulesDir, finalOptions);
  });

  // Remove the node_modules and use the new node_modules.
  fs.rmSync(oldNodeModulesDir, { force: true, recursive: true });
  fs.moveSync(newNodeModulesDir, oldNodeModulesDir);
}

/**
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default function excludeUselessScriptsInIntlMiniProgram(
  projectDir: string,
  options?: ExcludeUselessScriptsInIntlMiniProgramOptions,
) {
  fileCache.clear();
  copyFiles(projectDir, options);
}
