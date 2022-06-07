import webpack from 'webpack';
import getWebpackConf from './webpackConf';

export interface WebpackBuildOptions {
  projectDir: string;
  analyze?: boolean;
}

export default function webpackBuild(options: WebpackBuildOptions) {
  const webpackConf = getWebpackConf(options);

  return new Promise<webpack.StatsChunkGroup | undefined>((resolve, reject) => {
    webpack([webpackConf], (err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}
