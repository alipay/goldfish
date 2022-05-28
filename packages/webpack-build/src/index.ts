import webpack from 'webpack'
import { setConfig } from './ampConf'
import { AmpConf } from './types'
import getWebpackConf from './webpackConf'

interface Options {
  isWatch: boolean
  isProduct: boolean
  config: Partial<AmpConf>
}

export default function (options: Options) {
  const { isWatch, config } = options
  setConfig(config)

  const webpackConf = getWebpackConf(options)

  return new Promise((resolve, reject) => {
    const cb = (err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err || stats);
      } else {      
        resolve(stats);
      }
    }

    if (isWatch) {
      webpack([webpackConf]).watch([], cb)
    } else {
      webpack([webpackConf], cb)
    }    
  })
}
