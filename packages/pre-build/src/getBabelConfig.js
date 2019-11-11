const fs = require('fs-extra');
const path = require('path');

const cwd = process.cwd();
const importConfigPackages = [
  '@alipay/goldfish-utils',
  '@alipay/goldfish-reactive',
  '@alipay/goldfish-bridge',
  '@alipay/goldfish',
  '@alipay/goldfish-function-based-api',
  '@alipay/goldfish-plugins',
  '@alipay/goldfish-reactive-connect',
  '@alipay/goldfish-requester',
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
    console.warn(e);
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
      ],
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      ...importConfigPackages.reduce(
        (prev, pkgName) => {
          const config = getPkgImportConfig(pkgName);
          if (config) {
            prev.push(['import', config, pkgName]);
          }
          return prev;
        },
        [],
      ),
      [
        require.resolve('@babel/plugin-transform-react-jsx'),
        {
          pragma: '$createReactElement',
        },
      ],
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
