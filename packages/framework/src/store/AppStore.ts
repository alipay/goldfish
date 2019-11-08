import { AppStore as BaseAppStore } from '@alipay/goldfish-reactive-connect';
import { PluginHub, PluginClass } from '@alipay/goldfish-plugins';
import { IConfig, default as ConfigPlugin } from '../plugins/ConfigPlugin';

export default class AppStore extends BaseAppStore {
  protected pluginHub: PluginHub = new PluginHub();

  protected config?: IConfig;

  /**
   * Set the config immediately after the AppStore is created.
   *
   * @param config
   */
  public setConfig(config: IConfig) {
    if (!this.config) {
      throw new Error('The config has bean initialized.');
    }
    this.config = config;
  }

  /**
   * Get the plugins to register in the init process.
   * In the Subclass, users can override this method to provide your own plugins.
   */
  protected getPlugins(): PluginClass[] {
    return [
      ConfigPlugin,
    ];
  }

  /**
   * Initialize the AppStore.
   *
   * @lifecycle
   */
  public init() {
    super.init();
    const plugins = this.getPlugins();
    plugins.forEach(plugin => this.pluginHub.register(plugin));

    // Pass the config to the ConfigPlugin for the later other plugins to use.
    if (!this.config) {
      throw new Error('Please pass in the App config.');
    }
    this.pluginHub.get(ConfigPlugin).setConfig(this.config);

    // Initialize all plugins.
    this.pluginHub.init();
  }

  /**
   * Wait for the registered plugins ready.
   */
  public waitForPluginsReady() {
    return new Promise((resolve) => {
      const stop = this.watch(
        () => this.pluginHub.isReady(),
        (newVal) => {
          if (newVal) {
            resolve();
            stop();
          }
        },
        {
          immediate: true,
        },
      );
    });
  }

  /**
   * Wait for the init data finish loading.
   */
  public waitForInitDataReady() {
    return new Promise((resolve) => {
      const stop = this.watch(
        () => this.isInitLoading,
        (newVal) => {
          if (!newVal) {
            resolve();
            stop();
          }
        },
        {
          immediate: true,
        },
      );
    });
  }

  /**
   * Wait for all init processes ready.
   */
  public waitForReady() {
    return Promise.all([this.waitForInitDataReady(), this.waitForPluginsReady()]);
  }

  /**
   * Destroy the AppStore.
   *
   * @lifecycle
   */
  public destroy() {
    super.destroy();
    this.pluginHub.destroy();
  }
}
