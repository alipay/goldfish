import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin';
import AmpWebpackPlugin from '../plugin/amp-plugin';

export interface GetWebpackPluginsOptions {
  analyze?: boolean;
}

export default function getWebpackPlugins(options?: GetWebpackPluginsOptions) {
  const plugins: webpack.Configuration['plugins'] = [new AmpWebpackPlugin() /*, new FriendlyErrorsWebpackPlugin()*/];

  if (options?.analyze === true) {
    plugins.push(new BundleAnalyzerPlugin() as any);
  }

  return plugins;
}
