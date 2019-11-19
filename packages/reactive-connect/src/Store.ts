import {
  IStore,
  watch as baseWatch,
  IWatchExpressionFn,
  IWatchCallback,
  IWatchOptions,
  autorun as baseAutorun,
  AutorunFunction,
  IErrorCallback,
  DepList,
} from '@goldfishjs/reactive';
import STATE_KEY from './decorators/STATE_KEY';
import COMPUTED_KEY from './decorators/COMPUTED_KEY';
import observable from './decorators/observable';
import state from './decorators/state';

export type UnAutorun = (() => void) & {
  depList?: DepList | undefined;
};

function accessStoreProperties(
  keys: string[],
  store: Store,
) {
  return keys.reduce<Record<string, any>>(
    (prev, key) => {
      Object.defineProperty(prev, key, {
        get: () => {
          return (store as any)[key];
        },
        set: (v: any) => {
          (store as any)[key] = v;
        },
        enumerable: true,
      });
      return prev;
    },
    {},
  );
}

@observable
export default abstract class Store implements IStore {
  @state
  public isInitLoading = true;

  public stopWatchList: (() => void)[] = [];

  public stopAutorunList: (() => void)[] = [];

  public autorun(
    fn: AutorunFunction,
    errorCb?: IErrorCallback,
  ): UnAutorun {
    const stop = baseAutorun(fn, errorCb);
    this.stopAutorunList.push(stop);
    return stop;
  }

  public watch<R>(
    fn: IWatchExpressionFn<R>,
    cb: IWatchCallback<R>,
    options?: IWatchOptions,
  ) {
    const stop = baseWatch(fn, cb, options);
    this.stopWatchList.push(stop);
    return stop;
  }

  public getStateKeys(): string[] {
    return Object.keys((this as any)[STATE_KEY] || {});
  }

  public getComputedKeys(): string[] {
    return Object.keys((this as any)[COMPUTED_KEY] || {});
  }

  public getState(): Record<string, any> {
    const keys = this.getStateKeys();
    return accessStoreProperties(keys, this);
  }

  public getComputed(): Record<string, any> {
    const keys = this.getComputedKeys();
    return accessStoreProperties(keys, this);
  }

  /**
   * Fetch the init data from the server.
   *
   * @return Promise<void>
   */
  public fetchInitData(): Promise<void> {
    return Promise.resolve();
  }

  public init() {
    (async () => {
      this.isInitLoading = true;
      try {
        await this.fetchInitData();
      } finally {
        this.isInitLoading = false;
      }
    })();
  }

  public destroy() {
    this.stopWatchList.forEach(stop => stop());
    this.stopAutorunList.forEach(stop => stop());
  }
}
