import InitData from './InitData';
import {
  PluginHub,
  BridgePlugin,
  MockBridgePlugin,
  FeedbackPlugin,
  ConfigPlugin,
  RoutePlugin,
  MockRequesterPlugin,
  RequesterPlugin,
  PluginClass,
  Plugin,
  IConfig,
} from '@goldfishjs/plugins';
import { reactive } from '@goldfishjs/composition-api';

const defaultPlugins = [
  ConfigPlugin,
  RoutePlugin,
  FeedbackPlugin,
  process.env.NODE_ENV === 'development' ? MockBridgePlugin : BridgePlugin,
  process.env.NODE_ENV === 'development' ? MockRequesterPlugin : RequesterPlugin,
];

export interface IInitOptions<D> {
  plugins?: PluginClass[];
  data?: D;
  config?: IConfig;
}

export default class Global {
  public initData = new InitData();

  private pluginHub = new PluginHub();

  public data: any = undefined;

  public async init<D extends Record<string, any>>(options: IInitOptions<D> = {}) {
    this.data = reactive(options.data || {});

    const plugins = options.plugins || defaultPlugins;
    // Ensure the first plugin is ConfigPlugin.
    const normalizedPlugins = plugins[0] instanceof ConfigPlugin
      ? plugins
      : [ConfigPlugin, plugins[0]];

    normalizedPlugins.forEach((plugin) => {
      this.pluginHub.register(plugin);
    });

    const config = options.config || {};
    this.pluginHub.get(ConfigPlugin).setConfig(config);

    await this.pluginHub.init();
  }

  public destroy() {
    this.pluginHub.destroy();
  }

  public waitForPluginsReady() {
    return this.pluginHub.waitForReady();
  }

  public isPluginsReady() {
    return this.pluginHub.isReady();
  }

  public getPlugin<R extends Plugin>(pluginClass: PluginClass<R> | string): R {
    return this.pluginHub.get(pluginClass);
  }
}

export const global = new Global();
