import path from 'path';
import fs from 'fs-extra';
import findMiniDependencies from './findMiniDependencies';

function findPackageJson(dir: string): string | undefined {
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
 * Exclude the useless js files in miniprogram directory before uploading.
 *
 * @export
 * @param {string} projectDir the directory of the miniprogram directory (should be compiled with `goldfish compile`).
 */
export default function excludeUselessScriptsInIntlMiniProgram(projectDir: string) {
  const oldNodeModulesDir = path.resolve(projectDir, 'node_modules');
  const newNodeModulesDir = path.resolve(projectDir, 'node_modules_new');

  const dependencies = findMiniDependencies(projectDir);
  dependencies.forEach(dep => {
    const depFilePath = dep.importFilePath;
    if (!depFilePath.startsWith(projectDir)) {
      throw new Error(`The dependency \`${depFilePath}\` is not under the project \`${projectDir}\`.`);
    }

    // Only move the dependency under node_modules.
    if (!/\/node_modules\//.test(depFilePath)) {
      return;
    }

    fs.cpSync(depFilePath, depFilePath.replace(oldNodeModulesDir, newNodeModulesDir), { force: true });

    // Move the package.json
    const sourcePath = findPackageJson(path.dirname(depFilePath));
    if (sourcePath) {
      const targetPath = path.resolve(sourcePath.replace(oldNodeModulesDir, newNodeModulesDir));
      fs.cpSync(sourcePath, targetPath, { force: true });
    }
  });

  // Remove the node_modules and use the new node_modules.
  fs.rmSync(oldNodeModulesDir, { force: true, recursive: true });
  fs.moveSync(newNodeModulesDir, oldNodeModulesDir);
}
