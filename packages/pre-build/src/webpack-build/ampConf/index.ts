import { resolve } from 'path'
import { BuildOptions } from '../types'

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

export const ampConf: Partial<BuildOptions> = {
  platform: 'ali',
  appEntry: resolve('src/app.json'),
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {},
  alias: {},
  entryIncludes: [
    resolve('src/app.js'),
    resolve('src/app.acss'),
    resolve('src/app.json?asConfig&type=app'),
  ],
  // 不打包某个依赖 https://webpack.js.org/configuration/externals/
  externals: {},
  webpack(config){ return config }
}

export function setConfig(config: Partial<BuildOptions>) {
  Object.assign(ampConf, config)
}

export function getBuildOptions(): BuildOptions {
  return ampConf as BuildOptions
}
