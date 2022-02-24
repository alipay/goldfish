const babelTypes = require('babel-types');
const utils = require('@goldfishjs/pre-build/src/utils');
const libraryName = require('./package.json').name;

const findImportedPath = (pkgName, importedName) => {
  return require(`${pkgName}/babel-plugin-import-config`).customName(importedName);
};

function getImport(path) {
  return path.node.specifiers.reduce((result, specifier) => {
    if (specifier.imported) {
      result.push(
        babelTypes.importSpecifier(
          babelTypes.identifier(specifier.local.name),
          babelTypes.identifier(specifier.imported.name),
        ),
      );
    }
    return result;
  }, []);
}

function handleReactHooks(path, filename) {
  // The value of GOLDFISH_HOOKS_TARGET: mini、react.
  // If the target is not specified, do not compile, because of the common npm package development.
  const target = process.env.GOLDFISH_HOOKS_TARGET;

  if (target === 'mini') {
    const supportedBaseHooks = ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef', 'useState'];
    const nodes = [];
    path.node.specifiers.forEach(specifier => {
      if (specifier.imported) {
        if (!supportedBaseHooks.includes(specifier.imported.name)) {
          utils.error(
            `Detect unsupport React API ${
              specifier.imported.name
            } in file: \`${filename}\`. Current supported base hooks: ${supportedBaseHooks.join(',')}.`,
          );
        }
        nodes.push(
          babelTypes.importDeclaration(
            [babelTypes.importDefaultSpecifier(babelTypes.identifier(specifier.local.name))],
            babelTypes.stringLiteral(findImportedPath('@goldfishjs/hooks', specifier.imported.name)),
          ),
        );
      } else {
        utils.warn(
          `Detect default import from React in file: \`${filename}\`. Current supported base hooks: ${supportedBaseHooks.join(
            ',',
          )}.`,
        );
        nodes.push(
          babelTypes.importDeclaration(
            [babelTypes.importDefaultSpecifier(babelTypes.identifier(specifier.local.name))],
            babelTypes.stringLiteral('@goldfishjs/hooks'),
          ),
        );
      }
    });
    path.replaceWithMultiple(nodes);
  }
}

function handleHooks(path) {
  // The value of GOLDFISH_HOOKS_TARGET: mini、react.
  // If the target is not specified, do not compile, because of the common npm package development.
  const target = process.env.GOLDFISH_HOOKS_TARGET;

  if (target === 'mini') {
    const nodes = path.node.specifiers.reduce((result, specifier) => {
      if (specifier.imported) {
        result.push(
          babelTypes.importDeclaration(
            [babelTypes.importDefaultSpecifier(babelTypes.identifier(specifier.local.name))],
            babelTypes.stringLiteral(findImportedPath('@goldfishjs/hooks', specifier.imported.name)),
          ),
        );
      }
      return result;
    }, []);
    path.replaceWithMultiple(nodes);
  } else if (target === 'react') {
    const nodes = [];
    const specifierList = [];
    path.node.specifiers.forEach(specifier => {
      if (!specifier.imported) {
        return;
      }

      if (['useContainerType', 'useGlobalData', 'usePageQuery'].includes(specifier.imported.name)) {
        nodes.push(
          babelTypes.importDeclaration(
            babelTypes.importSpecifier(specifier.local.name, specifier.imported.name),
            babelTypes.stringLiteral(`@goldfishjs/core/hooks/${specifier.imported.name}4React`),
          ),
        );
      }

      specifierList.push(
        babelTypes.importSpecifier(
          babelTypes.identifier(specifier.local.name),
          babelTypes.identifier(specifier.imported.name),
        ),
      );
    });
    nodes.push(babelTypes.importDeclaration(specifierList, babelTypes.stringLiteral('react')));
    path.replaceWithMultiple(nodes);
  }
}

module.exports = () => {
  return {
    name: 'babel-plugin-goldfish-core',
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === `${libraryName}/utils`) {
          path.replaceWith(
            babelTypes.importDeclaration(getImport(path), babelTypes.stringLiteral('@goldfishjs/utils')),
          );
        } else if (path.node.source.value === 'react') {
          handleReactHooks(path, this.file.opts.filename);
        } else if (path.node.source.value === `${libraryName}/hooks`) {
          handleHooks(path);
        } else if (path.node.source.value === libraryName) {
          const map = {
            '@goldfishjs/react': [
              'useSetup',
              'useAutorun',
              'useWatch',
              'useContextType',
              'useProps',
              'useState',
              'useGlobalData',
              'useGlobalConfig',
              'useGlobalDestroy',
              'useGlobalStorage',
              'useMount',
              'useUnmount',
              'useRef',
              'app',
              'App',
              'useReactiveData',
            ],
            '@goldfishjs/reactive-connect': ['observable', 'state', 'computed'],
            '@goldfishjs/composition-api': [
              'setupApp',
              'setupComponent',
              'setupPage',
              'usePageLifeCycle',
              'useAppLifeCycle',
              'useComponentLifeCycle',
              'usePageEvents',
            ],
          };
          const findPkg = importedName => {
            for (const key in map) {
              if (map[key].includes(importedName)) {
                return findImportedPath(key, importedName);
              }
            }
          };
          const nodes = path.node.specifiers.reduce((result, specifier) => {
            result.push(
              babelTypes.importDeclaration(
                [babelTypes.importDefaultSpecifier(babelTypes.identifier(specifier.local.name))],
                babelTypes.stringLiteral(findPkg(specifier.imported.name)),
              ),
            );
            return result;
          }, []);
          path.replaceWithMultiple(nodes);
        }
      },
    },
  };
};
