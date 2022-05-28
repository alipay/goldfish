import { resolve } from 'path'

export const platformConf = {
  ali: {
    ext: {
      xml: '.axml',
      css: '.acss',
      json: '.json',
      js: '.js',
      njs: '.sjs',
    },
  },
  wx: {
    ext: {
      xml: '.wxml',
      css: '.wxss',
      json: '.json',
      js: '.js',
      njs: '.wss',
    },
  },
}

export const ampConf = {
  platform: 'ali',
  appEntry: resolve('src/app.json'),
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {},
  alias: {},
  style: '.less',
  entryIncludes: [
    resolve('src/app.ts'),
    resolve('src/app.less'),
    resolve('src/app.json?asConfig&type=app'),
  ],
  // 不打包某个依赖 https://webpack.js.org/configuration/externals/
  externals: {},
  webpack: (config) => config,
}
