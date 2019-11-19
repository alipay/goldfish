import { AppStore as BaseAppStore } from '@goldfishjs/goldfish-reactive-connect';
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
} from '@goldfishjs/goldfish-plugins';
import { asyncForEach } from '@goldfishjs/goldfish-utils';

export default class AppStore extends BaseAppStore {
  protected pluginHub: PluginHub = new PluginHub();

  protected config?: IConfig;

  protected stopWatchFeedbackQueue: (() => void) | undefined;

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

  public startWatchFeedbackQueue(options: {
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

  public async initFeedback() {
    await this.waitForPluginsReady();

    this.startWatchFeedbackQueue({
      showToast: (item): Promise<void> => {
        return new Promise((resolve) => {
          my.showToast(item);
          if (item.isBlock || item.duration) {
            if (item.duration) {
              setTimeout(() => resolve(), item.duration);
            } else {
              resolve();
              my.hideToast();
            }
          } else {
            my.hideToast();
            resolve();
          }
        });
      },
      alert: (item) => {
        return new Promise((resolve) => {
          if (item.isBlock) {
            my.alert({
              ...item,
              complete: () => {
                resolve();
                if (item.complete) {
                  item.complete();
                }
              },
            });
          } else {
            my.alert(item);
            resolve();
          }
        });
      },
      confirm: (item) => {
        return new Promise((resolve) => {
          my.confirm({
            ...item,
            confirmButtonText: item.okButtonText,
            complete: (result) => {
              if (item.isBlock) {
                resolve();
              }
              if (item.complete) {
                item.complete(
                  result.confirm
                    ? { ok: true, cancel: false }
                    : { ok: false, cancel: true },
                );
              }
            },
          });
          if (!item.isBlock) {
            resolve();
          }
        });
      },
      prompt: (item) => {
        return new Promise((resolve) => {
          my.prompt({
            ...item,
            message: item.content || 'prompt',
            success: (result) => {
              item.complete && item.complete(
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
   * Update Pages for Route
   */
  public updatePages(page: tinyapp.IAppLaunchOptions) {
    this.pluginHub.get(RoutePlugin).updatePages(page);
  }
}
