import { resolve } from 'path';

export default {
  performance: {
    hints: false,
  },
  mode: 'none',
  resolve: {
    modules: ['node_modules'],
    alias: {},
  },
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
      minSize: 0,
      enforceSizeThreshold: Infinity,
      maxSize: Infinity,
      automaticNameDelimiter: '-',
    },
    runtimeChunk: {
      name: 'bundle',
    },
  },
};
