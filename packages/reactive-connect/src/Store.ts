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
} from '@alipay/goldfish-reactive';
import STATE_KEY from './decorators/STATE_KEY';
import COMPUTED_KEY from './decorators/COMPUTED_KEY';

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

export default abstract class Store implements IStore {
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

  public abstract init(): void;

  public destroy() {
    this.stopWatchList.forEach(stop => stop());
    this.stopAutorunList.forEach(stop => stop());
  }
}
