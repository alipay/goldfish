import { AppStore as BaseAppStore, observable, state } from '@goldfishjs/reactive-connect';

/**
 * State management for App.
 */
@observable
export default class AppStore extends BaseAppStore {
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
   * Wait for the init data finish loading.
   */
  public waitForInitDataReady(): Promise<void> {
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
   * Destroy the AppStore.
   *
   * @lifecycle
   */
  public destroy() {
    super.destroy();
  }
}
