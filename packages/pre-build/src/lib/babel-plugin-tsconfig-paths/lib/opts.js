const path = require('path');
const fs = require('fs-extra');
const { escapeRegExp } = require('./utils');

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es', '.es6', '.mjs'];
const transformFunctions = [
  'require',
  'require.resolve',
  'System.import',
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
  'jest.setMock',
  'require.requireActual',
  'require.requireMock',
];

const getRootDir = str => {
  if (!str) str = process.cwd();
  if (!path.isAbsolute(str)) {
    str = path.resolve(path.join(process.cwd(), str));
  }
  return str;
};
const getConfigPath = (config = 'tsconfig.json', root = process.cwd()) => {
  if (!path.isAbsolute(config)) {
    config = path.resolve(path.join(root, config));
  }
  return config;
};
const getTsconfigAliases = (
  tsconfig = {
    compilerOptions: {},
  },
) => {
  const aliases = tsconfig.compilerOptions.paths || {};

  const resolveAliases = [];

  Object.entries(aliases).forEach(([alias, resolutions]) => {
    const newAlias = new RegExp(`^${escapeRegExp(alias).replace(/\*/g, '(.+)')}`);
    const transformers = resolutions.map(res => {
      let cnt = 1;
      do {
        const hasWildcard = res.indexOf('*') > -1;
        if (!hasWildcard) break;
        res = res.replace('*', `$${cnt++}`);
      } while (true); // eslint-disable-line no-constant-condition
      return res;
    });
    resolveAliases.push({
      alias: newAlias,
      transformers,
    });
  });
  return resolveAliases;
};

exports.getOptions = opts => {
  const rootDir = getRootDir(opts.rootDir);
  const configPath = getConfigPath(opts.tsconfig, rootDir);
  if (!fs.existsSync(configPath)) {
    return;
  }
  const tsconfig = require(configPath);
  const base = tsconfig.compilerOptions.baseUrl || '';
  const basePath = path.isAbsolute(base) ? base : path.resolve(path.join(path.dirname(configPath), base));

  return {
    configPath,
    basePath,
    aliases: getTsconfigAliases(tsconfig),
    relative: opts.relative || true,
    extensions: opts.extensions || extensions,
    transformFunctions: opts.transformFunctions || transformFunctions,
    skipModuleResolver: !base,
  };
};
