import watch, { IWatchOptions } from './watch';
import { ChangeOptions } from './dep';

export interface IWatchDeepCallback {
  (obj: any, keyPathList: (string | number)[], newV: any, oldV: any, options?: ChangeOptions): void;
}

export interface IWatchDeepOptions extends Omit<IWatchOptions, 'deep'> {
  customWatch?: typeof watch;
}

function isObject(v: any) {
  return v && typeof v === 'object';
}

class Watcher {
  private obj: any;

  private options?: IWatchDeepOptions;

  private callback?: IWatchDeepCallback;

  public constructor(
    obj: any,
    callback: IWatchDeepCallback,
    options?: IWatchDeepOptions,
  ) {
    this.obj = obj;
    this.callback = callback;
    this.options = options;
  }

  private iterate(curObj: any, keyPathList: (string | number)[] = []) {
    const baseWatch = this.options && this.options.customWatch || watch;
    const stopList: (() => void)[] = [];
    if (curObj && typeof curObj === 'object') {
      for (const key in curObj) {
        const keyStopList: Function[] = [];
        stopList.push(baseWatch(
          () => curObj[key],
          (newV, oldV, options) => {
            this.callback && this.callback(this.obj, [...keyPathList, key], newV, oldV, options);

            // If the old value is an object, then clear all children watchers on it.
            if (isObject(oldV)) {
              keyStopList.forEach(stop => stop());
              keyStopList.splice(0, keyStopList.length);
            }

            // If the new value is an object, then set watchers on it's children.
            if (isObject(newV)) {
              keyStopList.push(...this.iterate(newV, [...keyPathList, key]));
            }
          },
          this.options,
        ));

        if (!this.options || !this.options.immediate) {
          keyStopList.push(...this.iterate(curObj[key], [...keyPathList, key]));
        }
      }
    }
    return stopList;
  }

  public watch() {
    return this.iterate(this.obj);
  }
}

export default function watchDeep(
  obj: any,
  callback: IWatchDeepCallback,
  options?: IWatchDeepOptions,
) {
  const watcher = new Watcher(obj, callback, options);
  return watcher.watch();
}
