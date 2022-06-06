import webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getBuildOptions } from '../ampConf'
import AmpWebpackPlugin from '../plugin/amp-plugin'
import { BuildOptions } from '../types'

export default function getWebpackPlugins(options: BuildOptions) {
  const { isProduct, analyze } = options
  const { defineConstants } = getBuildOptions()

  const plugins = [
    new AmpWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isProduct ? '"production"' : '"development"',
      },
      ...defineConstants,
    }),
  ]

  if (analyze) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  return plugins
}
