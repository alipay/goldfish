import webpack from 'webpack';
import ampEntry from './ampEntry';
import getWebpackConf from './webpackConf';
import getWebpackPlugins from './webpackConf/getPlugins';

export interface WebpackBuildOptions {
  projectDir: string;
  analyze?: boolean;
}

function webpackBuildSjs(options: WebpackBuildOptions) {
  return new Promise<void>((resolve, reject) => {
    ampEntry.clearEntryOutputMap();
    webpack(
      [
        {
          context: ampEntry.sourceRoot,
          // entry: ampEntry.sjsEntryObject,
          entry: {
            'components/button/button': './components/button/button',
            // 'pages/index/index': './pages/index/index',
          },
          plugins: getWebpackPlugins(options),
          resolve: {
            extensions: ['.sjs'],
          },
          mode: 'production',
          output: {
            path: ampEntry.outputRoot,
            filename: '[name].sjs',
          },
          optimization: {
            minimize: false,
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
              name: 'bundle4sjs',
            },
          },
        },
      ],
      err => {
        ampEntry.destroy();
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

export default async function webpackBuild(options: WebpackBuildOptions) {
  const webpackConf = getWebpackConf(options);

  return new Promise<webpack.StatsChunkGroup | undefined>((resolve, reject) => {
    // webpack([webpackConf], (err, stats) => {
    //   if (err) return reject(err);
    //   resolve(stats);
    // });
    resolve(undefined);
  }).then(async result => {
    await webpackBuildSjs(options);
    return result;
  });
}
