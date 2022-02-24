const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const lodash = require('lodash');
const utils = require('./utils');

let pkgCache = {};
let babelPkgDirs = {};
function parsePkgPluginConfig(pkgRootDir) {
  const pkgJson = require(path.resolve(pkgRootDir, 'package.json'));
  if (!pkgCache[pkgJson.name]) {
    const plugins = [];

    const babelPluginPath = path.resolve(pkgRootDir, 'babel-plugin.js');
    if (fs.existsSync(babelPluginPath)) {
      plugins.push(babelPluginPath);
      babelPkgDirs[pkgRootDir] = true;
    }

    const babelImportPluginPath = path.resolve(pkgRootDir, 'babel-plugin-import-config.js');
    if (fs.existsSync(babelImportPluginPath)) {
      plugins.push(['babel-plugin-import', require(babelImportPluginPath), pkgJson.name]);
      babelPkgDirs[pkgRootDir] = true;
    }

    if (/^@goldfishjs/.test(pkgJson.name)) {
      pkgCache[pkgJson.name] = [
        {
          pkgJson: pkgJson,
          path: pkgRootDir,
          plugins,
        },
      ];
    }

    return plugins;
  }

  pkgCache[pkgJson.name].push({
    pkgJson: pkgJson,
    path: pkgRootDir,
  });
  return [];
}

function findFiles(dir) {
  const pathSegList = dir.split(path.sep);
  const files = [];
  while (pathSegList.length) {
    const currentDir = path.resolve(pathSegList.join(path.sep), 'node_modules');
    if (fs.pathExistsSync(currentDir)) {
      files.push(
        ...glob.sync(path.resolve(currentDir, '@goldfishjs/*/package.json'), { follow: false }),
      );
    }
    pathSegList.pop();
  }
  return lodash.uniq(files);
}

/**
 * 获取 babel 配置
 *
 * @param {string} rootDir 项目根目录
 * @param {object} options
 * @param {string} options.isH5 H5 环境
 * @returns
 */
module.exports = (rootDir = process.cwd(), options = {}) => {
  const babelConfig = {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
          targets: {
            browsers: ['last 2 versions', 'safari >= 7'],
          },
        },
      ],
    ],
    plugins: [
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: false,
        },
      ],
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      require.resolve('@babel/plugin-proposal-class-properties'),
      '@babel/plugin-proposal-optional-chaining',
    ],
  };

  if (options.isH5) {
    babelConfig.plugins.push(require.resolve('./babelPluginRemixWebMin.js'));
  }

  const files = findFiles(rootDir);
  babelPkgDirs = {};
  pkgCache = {};
  const plugins = lodash.flatten(
    files.map(file => {
      return parsePkgPluginConfig(file.replace(/package\.json$/, ''));
    }),
  );

  babelConfig.plugins.push(...plugins);

  lodash.forEach(pkgCache, (data, name) => {
    if (data.length > 1) {
      utils.warn(
        '\n' +
          [
            `A total of ${data.length} ${name} installation packages were found:`,
            data.map(({ path, pkgJson }) => `    ${path} --> version: ${pkgJson.version}`).join('\n'),
            `    The babel plugin is used: ${data[0].path} --> ${data[0].pkgJson.version}`,
          ].join('\n') +
          '\n',
      );
    }
  });

  return babelConfig;
};

module.exports.getBabelPkgDirs = () => {
  return Object.keys(babelPkgDirs);
};
