const fs = require('fs');
const path = require('path');

const getResolvers = (importPath, aliases) => {
  const resolver = aliases.find(({ alias }) => alias.test(importPath));
  if (resolver) return resolver;
};

const getRelativePath = (from, to) => {
  const relPath = path.relative(path.dirname(from), to);

  return relPath.startsWith('./') || relPath.startsWith('../') ? relPath : `./${relPath}`;
};

/**
 * Assuming an alias like this
 * ```
 * "~/*": ["src/*"]
 * ```
 *
 * And an import like this:
 * ```
 * "~/app"
 * ```
 *
 * This will see that `~/*` matches `~/app`, and use a regular
 * expression to replace `/^~\/(.+)/` with `src/$1` like this:
 *
 * ```
 * '~/app'.replace(/^~\/(.+)/, 'src/$1')
 * ```
 *
 * Then it will prepend the absolute `baseUrl` collected from
 * `tsconfig` to the import path.
 *
 * If `relative: true`, it will then use that absolute path to retrieve
 * the _relative_ path of the import (relative to the original source file)
 *
 * @param {string} sourceFile - The original source file that the import
 * was found in
 * @param {string} importPath - The path to the file being imported (the
 * string that needs to be resolved)
 * @param {string} basePath - The absolute path retrieved from
 * `tsconfig.compilerOptions.baseUrl`.
 * @param {string[]} extensions - The list of extensions to attempt to use
 * to verify the existence of the import file
 * @param {object} aliases - The aliases collected from `tsconfig`.  These
 * will have been converted into regular expressions already.
 * @param {boolean} relative - Should this import be resolved to a relative path,
 * or an absolute.  Defaults to `true`
 *
 * @returns {string} The resolved path of the import.  If unable to return a
 * resolved path, then void is returned.
 */
const resolvePath = (sourceFile, importPath, basePath, extensions, aliases, relative) => {
  const resolver = getResolvers(importPath, aliases);
  if (!resolver) return;

  const { alias, transformers } = resolver;

  for (const transformer of transformers) {
    const transformedImport = path.join(basePath, importPath.replace(alias, transformer));
    let checkImport = transformedImport;
    try {
      const stat = fs.statSync(transformedImport);
      if (stat && stat.isDirectory()) {
        checkImport = path.join(transformedImport, 'index');
      }
    } catch (err) {
      // noop
    }

    // If the original import has an extension, then check for it, too, when
    // checking for existence of the file
    const checkExtensions = [''].concat(extensions);
    const fileVariations = checkExtensions.map(ext => checkImport + ext);

    const realFile = fileVariations.find(file => fs.existsSync(file));
    if (realFile) {
      return (relative ? getRelativePath(sourceFile, realFile) : realFile)
        .replace(/\\/g, '/')
        .replace(/\.(ts|tsx)$/, '');
    }
  }
};

exports.updateImportPath = (nodePath, state) => {
  if (!state.types.isStringLiteral(nodePath)) {
    return;
  }
  if (nodePath.node.pathResolved) {
    return;
  }

  const currentFile = state.file.opts.filename;
  const importPath = nodePath.node.value;
  const { basePath, aliases, relative, extensions } = state.runtimeOpts;
  const modulePath = resolvePath(currentFile, importPath, basePath, extensions, aliases, relative);
  if (modulePath) {
    nodePath.replaceWith(state.types.stringLiteral(modulePath));
    nodePath.node.pathResolved = true;
  }
};
