import webpack from 'webpack'
import { setConfig } from './ampConf'
import { BuildOptions } from './types'
import getWebpackConf from './webpackConf'

export default function (options: Partial<BuildOptions>) {
  const webpackConf = getWebpackConf(options)

  setConfig(options)

  return new Promise((resolve, reject) => {
    webpack([webpackConf], (err, stats) => {
      if(err) return reject(err)
      resolve(stats)
    })
  })
}
