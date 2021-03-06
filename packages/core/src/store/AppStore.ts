import { AppStore as BaseAppStore, observable, state } from '@goldfishjs/reactive-connect';
import {
  PluginHub,
  PluginClass,
  BridgePlugin,
  MockBridgePlugin,
  FeedbackPlugin,
  IConfig,
  ConfigPlugin,
  IToastOption,
  IAlertOption,
  IConfirmOption,
  IPromptOption,
  FeedbackOption,
  RoutePlugin,
  MockRequesterPlugin,
  RequesterPlugin,
  Plugin,
} from '@goldfishjs/plugins';
import { asyncForEach } from '@goldfishjs/utils';

/**
 * State management for App.
 */
@observable
export default class AppStore extends BaseAppStore {
  /**
   * The plugins manager.
   *
   * @protected
   * @type {PluginHub}
   * @memberof AppStore
   */
  protected pluginHub: PluginHub = new PluginHub();

  /**
   * Store the configuration data.
   *
   * @protected
   * @type {IConfig}
   * @memberof AppStore
   */
  protected config?: IConfig;

  protected stopWatchFeedbackQueue: (() => void) | undefined;

  /**
   * The error in Promise will not be catch by Alipay,
   * so we should do it by ourself.
   *
   * @type {*}
   * @memberof AppStore
   */
  @state
  public globalErrorInPromise: any = null;

  /**
   * Set the config immediately after the AppStore is created.
   *
   * @param config
   */
  public setConfig(config: IConfig) {
    if (this.config) {
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
      RoutePlugin,
      FeedbackPlugin,
      process.env.NODE_ENV === 'development' ? MockBridgePlugin : BridgePlugin,
      process.env.NODE_ENV === 'development' ? MockRequesterPlugin : RequesterPlugin,
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
    this.pluginHub.init().catch(e => {
      // The Alipay does not catch the exception in Promise,
      // so print the error here for debug.
      console.error(e);
      this.globalErrorInPromise = e;
      throw e;
    });
  }

  /**
   * Get the specified plugin instance.
   *
   * @param pluginClass
   */
  public getPluginInstance<R extends Plugin>(pluginClass: PluginClass<R> | string) {
    return this.pluginHub.get<R>(pluginClass);
  }

  /**
   * Wait for the registered plugins ready.
   */
  public waitForPluginsReady() {
    return this.pluginHub.waitForReady();
  }

  /**
   * Wait for the init data finish loading.
   */
  public waitForInitDataReady() {
    return new Promise(resolve => {
      const stop = this.watch(
        () => this.isInitLoading,
        newVal => {
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

  private startWatchFeedbackQueue(options: {
    showToast?: (item: IToastOption) => Promise<void>;
    alert?: (item: IAlertOption) => Promise<void>;
    confirm?: (item: IConfirmOption) => Promise<void>;
    prompt?: (item: IPromptOption) => Promise<void>;
  }) {
    const feedback = this.pluginHub.get(FeedbackPlugin);
    if (!feedback) {
      throw new Error('No feedback.');
    }

    if (this.stopWatchFeedbackQueue) {
      return this.stopWatchFeedbackQueue;
    }

    let isFeedbackConsuming = false;
    let shouldStopIteration = false;
    const stop = this.watch(
      () => feedback.feedbackQueue,
      async () => {
        if (isFeedbackConsuming) {
          return;
        }
        isFeedbackConsuming = true;

        const queue = [...feedback.feedbackQueue];
        await asyncForEach(queue, async (item: FeedbackOption) => {
          if (shouldStopIteration) {
            return true;
          }

          switch (item.popType) {
            case 'toast':
              await (options.showToast && options.showToast(item));
              break;
            case 'alert':
              await (options.alert && options.alert(item));
              break;
            case 'confirm':
              await (options.confirm && options.confirm(item));
              break;
            case 'prompt':
              await (options.prompt && options.prompt(item));
              break;
          }
        });

        isFeedbackConsuming = false;

        if (feedback.feedbackQueue.length && queue.length) {
          feedback.feedbackQueue.splice(0, queue.length);
        }
      },
      {
        immediate: true,
      },
    );
    this.stopWatchFeedbackQueue = () => {
      stop();
      this.stopWatchFeedbackQueue = undefined;
      shouldStopIteration = true;
    };
    return this.stopWatchFeedbackQueue;
  }

  /**
   * Initialize the global feedback module.
   * It is used to manage the global toasts, alerts, prompts and confirms.
   */
  public async initFeedback() {
    await this.waitForPluginsReady();
    const bridge = this.getPluginInstance(BridgePlugin);

    this.startWatchFeedbackQueue({
      showToast: (item): Promise<void> => {
        return new Promise(resolve => {
          bridge.call('showToast', item);
          if (item.isBlock || item.duration) {
            if (item.duration) {
              setTimeout(() => resolve(), item.duration);
            } else {
              resolve();
              bridge.call('hideToast');
            }
          } else {
            bridge.call('hideToast');
            resolve();
          }
        });
      },
      alert: item => {
        return new Promise(resolve => {
          if (item.isBlock) {
            bridge.call('alert', {
              ...item,
              complete: () => {
                resolve();
                if (item.complete) {
                  item.complete();
                }
              },
            });
          } else {
            bridge.call('alert', item);
            resolve();
          }
        });
      },
      confirm: item => {
        return new Promise(resolve => {
          bridge.call('confirm', {
            ...item,
            confirmButtonText: item.okButtonText,
            complete: result => {
              if (item.isBlock) {
                resolve();
              }
              if (item.complete) {
                item.complete(result.confirm ? { ok: true, cancel: false } : { ok: false, cancel: true });
              }
            },
          });
          if (!item.isBlock) {
            resolve();
          }
        });
      },
      prompt: item => {
        return new Promise(resolve => {
          bridge.call('prompt', {
            ...item,
            message: item.content || 'prompt',
            success: result => {
              item.complete &&
                item.complete(
                  result.ok
                    ? {
                        ok: true,
                        cancel: false,
                        inputValue: result.inputValue,
                      }
                    : {
                        ok: false,
                        cancel: true,
                      },
                );
            },
            fail: () => {
              item.complete && item.complete({ ok: false, cancel: false });
            },
            complete: resolve,
          });
        });
      },
    });
  }

  /**
   * Update Pages for Route. Only for inner usages.
   */
  public updatePages(page: tinyapp.IAppLaunchOptions) {
    this.pluginHub.get(RoutePlugin).updatePages(page);
  }
}
