const fs = require('fs-extra');
const path = require('path');
const utils = require('./utils');

const cwd = process.cwd();
const importConfigPackages = [
  '@goldfishjs/goldfish-utils',
  '@goldfishjs/goldfish-reactive',
  '@goldfishjs/goldfish-bridge',
  '@goldfishjs/goldfish',
  '@goldfishjs/goldfish-composition-api',
  '@goldfishjs/goldfish-plugins',
  '@goldfishjs/goldfish-reactive-connect',
  '@goldfishjs/goldfish-requester',
];

function getPkgImportConfig(pkgName) {
  try {
    const pkgDir = require.resolve(`${pkgName}/package.json`, {
      paths: [cwd],
    }).replace(/package\.json$/, '');
    const importConfigPath = path.resolve(pkgDir, './babel-plugin-import-config.js');
    if (fs.existsSync(importConfigPath)) {
      return require(importConfigPath);
    }
  } catch (e) {
    utils.log(`Find package failed: ${pkgName}.`);
  }
}

function getBabelConfig(env) {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: env === 'test' ? 'commonjs' : false,
          targets: {
            browsers: ['last 2 versions', 'safari >= 7']
          },
        },
      ]
    ],
    plugins: [
      ...importConfigPackages.reduce(
        (prev, pkgName) => {
          const config = getPkgImportConfig(pkgName);
          if (config) {
            prev.push([require.resolve('babel-plugin-import'), config, pkgName]);
          }
          return prev;
        },
        [],
      ),
      [
        require.resolve('@babel/plugin-transform-for-of'),
        {
          loose: true,
        },
      ],
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: false,
        },
      ],
      [
        require.resolve('babel-plugin-root-import'),
        {
          rootPathPrefix: '/',
        },
      ],
      require.resolve('@babel/plugin-proposal-class-properties'),
    ]
  };
}

module.exports = getBabelConfig;
