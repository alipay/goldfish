import { resolve } from 'path'

export default {
  performance: {
    hints: false,
  },
  mode: 'none',
  resolve: {
    modules: ['node_modules'],
    alias: {},
  },
  // cache: {
  //   type: 'filesystem',
  //   buildDependencies: {
  //     // config: [resolve('config/')],
  //   },
  //   cacheDirectory: resolve('.cache/'),
  // },
  snapshot: {
    managedPaths: [resolve('node_modules/')],
  },
  optimization: {
    emitOnErrors: true,
    splitChunks: {
      defaultSizeTypes: ['javascript', 'unknown'],
      chunks: 'all',
      usedExports: true,
      minChunks: 1,
      minSize: 1000,
      enforceSizeThreshold: Infinity,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '-',
    },
    runtimeChunk: {
      name: 'bundle',
    },
  },
}
