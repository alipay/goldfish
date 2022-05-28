import { resolve } from 'path'
import { parseAmpConf, platformConf } from '../ampConf'

export default function getWebpackRules() {
  const { alias, sourceRoot, platform } = parseAmpConf()
  const { xml, css, json, njs } = platformConf[platform].ext

  const babelLoader = {
    loader: 'babel-loader',
    options: {
      plugins: [
        [
          'module-resolver',
          {
            root: './src',
            alias: {
              '@': './src',
              ...alias,
            },
          },
        ],
      ],
    },
  }

  return [
    {
      test: /\.js$/,
      use: [babelLoader],
      include: [resolve(sourceRoot)],
    },
    {
      test: /\.ts$/,
      use: [babelLoader, 'ts-loader'],
      include: [resolve(sourceRoot)],
    },
    {
      test: new RegExp(json),
      resourceQuery: /asConfig/,
      use: [require.resolve('@goldfishjs/webpack-build/lib/loader/json-loader')],
      type: 'javascript/auto',
    },
    {
      test: new RegExp(xml),
      use: [require.resolve('@goldfishjs/webpack-build/lib/loader/xml-loader')],
    },
    {
      test: new RegExp(css),
      use: [require.resolve('@goldfishjs/webpack-build/lib/loader/file-loader')],
    },
    {
      test: new RegExp(njs),
      use: [require.resolve('@goldfishjs/webpack-build/lib/loader/file-loader'), babelLoader],
    },
    {
      test: /\.less/,
      use: [
        {
          loader: require.resolve('@goldfishjs/webpack-build/lib/loader/file-loader'),
          options: { ext: css },
        },
        require.resolve('less-loader'),
      ],
    },
    {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [require.resolve('@goldfishjs/webpack-build/lib/loader/file-loader')],
    },
  ]
}
