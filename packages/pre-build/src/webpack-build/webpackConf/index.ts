import { resolve } from 'path';
import webpack from 'webpack';
import { mergeWithCustomize, customizeObject } from 'webpack-merge';
import baseConf from './baseConf';
import getWebpackRules from './getRules';
import getWebpackPlugins from './getPlugins';
import { getBuildOptions } from '../ampConf';
import { BuildOptions } from '../types';

export default function getWebpackConf(options: Partial<BuildOptions>): webpack.Configuration {
  const { isProduct, isWatch } = options as any;

  const { outputRoot, webpack: userWebpack, entryIncludes, externals } = getBuildOptions();

  const config: webpack.Configuration = {
    entry: { app: entryIncludes },
    output: {
      path: resolve(outputRoot),
      publicPath: '/',
      filename: '[name].js',
    },
    resolve: {
      // https://webpack.js.org/configuration/resolve#resolveextensions
      extensions: ['.ts', '...'],
    },
    externals,
    mode: isProduct ? 'production' : 'none',
    optimization: {
      nodeEnv: isProduct ? 'production' : 'development',
    },
    devtool: isWatch ? 'inline-source-map' : false,
    plugins: getWebpackPlugins(options as any),
    module: { rules: getWebpackRules() },
  };

  return userWebpack(
    mergeWithCustomize({
      customizeObject: customizeObject({
        snapshot: 'merge',
      }),
    })(baseConf, config),
  );
}
