import { AppStore as BaseAppStore } from '@alipay/goldfish-reactive-connect';
import { PluginHub, PluginClass } from '@alipay/goldfish-plugins';

export default class AppStore extends BaseAppStore {
  protected pluginHub: PluginHub = new PluginHub();

  /**
   * Get the plugins to register in the init process.
   * In the Subclass, users can override this method to provide your own plugins.
   */
  protected getPlugins(): PluginClass[] {
    return [];
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
