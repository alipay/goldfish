import { resolve } from 'path';
import webpack from 'webpack';
import { mergeWithCustomize, customizeObject } from 'webpack-merge';
import baseConf from './baseConf';
import getWebpackRules from './getRules';
import getWebpackPlugins from './getPlugins';
import ampEntry from '../ampEntry';

export interface GetWebpackConfOptions {
  projectDir: string;
  analyze?: boolean;
}

export default function getWebpackConf(options: GetWebpackConfOptions): webpack.Configuration {
  const entryIncludes = ['./app.js', './app.json?asConfig'];

  const sourceRoot = options.projectDir;
  const outputRoot = resolve(options.projectDir, 'dist');

  ampEntry.init(sourceRoot, outputRoot, resolve(options.projectDir, './app.json'));

  const config: webpack.Configuration = {
    context: options.projectDir,
    entry: { app: entryIncludes },
    output: {
      path: outputRoot,
      filename: '[name].js',
    },
    mode: 'production',
    optimization: {
      nodeEnv: 'production',
      minimize: false,
    },
    devtool: false,
    plugins: getWebpackPlugins(options),
    module: { rules: getWebpackRules() },
  };

  return mergeWithCustomize({
    customizeObject: customizeObject({
      snapshot: 'merge',
    }),
  })(baseConf, config);
}
