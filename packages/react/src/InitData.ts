import { observable, state } from '@goldfishjs/reactive-connect';
import { watch } from '@goldfishjs/reactive';

@observable
export default class InitData {
  @state
  private isInitLoading = true;

  private fetchInitDataMethod?: () => Promise<void>;

  public addFetchInitDataMethod(fn: () => Promise<void>, isAsync = true) {
    const fetchInitDataMethod = this.fetchInitDataMethod;
    if (fetchInitDataMethod) {
      this.fetchInitDataMethod = isAsync
        ? async function (this: any) {
          await Promise.all([fetchInitDataMethod.call(this), fn.call(this)]);
        }
        : async function (this: any) {
          await fetchInitDataMethod.call(this);
          await fn.call(this);
        };
    } else {
      this.fetchInitDataMethod = fn;
    }
  }

  public async init() {
    if (!this.isInitLoading) {
      throw new Error('The init data has been loaded.');
    }

    try {
      if (this.fetchInitDataMethod) {
        await this.fetchInitDataMethod();
      }
    } catch (e) {
      throw e;
    } finally {
      this.isInitLoading = false;
    }
  }

  public waitForReady() {
    return new Promise((resolve) => {
      const stop = watch(
        () => this.isInitLoading,
        (newV) => {
          if (!newV) {
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
}
