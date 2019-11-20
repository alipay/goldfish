import { state, observable } from '@goldfishjs/reactive-connect';
import { watch } from '@goldfishjs/reactive';
import Plugin, { PluginClass } from './Plugin';

@observable
export default class PluginHub {
  protected plugins: Record<string, Plugin> = {};

  @state
  protected state: 'not_init' | 'init_start' | 'ready' | 'destroyed' = 'not_init';

  public isReady() {
    return this.state === 'ready';
  }

  public async register(pluginClass: PluginClass) {
    if (!pluginClass.type) {
      throw new Error(`Please set the static type property for PluginClass: ${pluginClass}`);
    }

    const plugin = new pluginClass();
    this.plugins[pluginClass.type] = plugin;

    if (this.state === 'init_start') {
      return new Promise((resolve, reject) => {
        const stop = watch(
          () => this.state,
          (newVal) => {
            if (newVal === 'ready') {
              try {
                plugin.init(this.get.bind(this));
                resolve();
              } catch (e) {
                reject(e);
              }
              stop();
            }
          },
        );
      });
    }

    if (this.state === 'ready') {
      plugin.init(this.get.bind(this));
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

  public async init() {
    this.state = 'init_start';
    for (const type in this.plugins) {
      const plugin = this.plugins[type];
      plugin.init(this.get.bind(this));
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
