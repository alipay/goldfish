import webpack from 'webpack'
import { parseAmpConf } from '../ampConf'
import AmpWebpackPlugin from '../plugin/amp-plugin'

export default function getWebpackPlugins(options: any) {
  const { isProduct } = options
  const { defineConstants } = parseAmpConf()

  return [
    new AmpWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isProduct ? '"production"' : '"development"',
      },
      ...defineConstants,
    }),
  ]
}
