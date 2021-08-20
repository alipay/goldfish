import { state, observable } from '@goldfishjs/reactive-connect';
import { watch } from '@goldfishjs/reactive';
import Plugin, { PluginClass } from './Plugin';

@observable
export default class PluginHub {
  protected plugins: Record<string, Plugin> = {};

  @state
  protected state: 'not_init' | 'init_start' | 'ready' | 'destroyed' = 'not_init';

  /**
   * Check that if all registered plugins are ready.
   */
  public isReady() {
    return this.state === 'ready';
  }

  /**
   * Wait for the registered plugins being initialized.
   *
   * @return Promise
   */
  public waitForReady(): Promise<void> {
    return new Promise(resolve => {
      const stop = watch(
        () => this.isReady(),
        newVal => {
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

  public async register(pluginClass: PluginClass) {
    if (!pluginClass.type) {
      throw new Error(`Please set the static type property for PluginClass: ${pluginClass}`);
    }

    const plugin = new pluginClass();
    this.plugins[pluginClass.type] = plugin;

    if (this.state === 'init_start') {
      await this.waitForReady();
      plugin.init(this.get.bind(this));
      plugin.isInitCompleted = true;
      return;
    }

    if (this.state === 'ready') {
      plugin.init(this.get.bind(this));
      plugin.isInitCompleted = true;
    }
  }

  public get<R extends Plugin>(pluginClass: PluginClass<R> | string): R {
    if (typeof pluginClass === 'string') {
      for (const type in this.plugins) {
        const plugin = this.plugins[type];
        if (pluginClass === type) {
          return plugin as R;
        }
      }
    } else {
      for (const type in this.plugins) {
        const plugin = this.plugins[type];
        if (plugin instanceof pluginClass) {
          return plugin as R;
        }
      }
    }

    throw new Error(`The plugin ${pluginClass} is not registered.`);
  }

  /**
   * Initialize the registered plugins.
   *
   * @lifecycle
   */
  public async init() {
    this.state = 'init_start';
    for (const type in this.plugins) {
      const plugin = this.plugins[type];
      await plugin.init(this.get.bind(this));
      plugin.isInitCompleted = true;
    }
    this.state = 'ready';
  }

  public destroy() {
    for (const type in this.plugins) {
      const plugin = this.plugins[type];
      plugin.destroy();
    }
    this.state = 'destroyed';
  }
}
