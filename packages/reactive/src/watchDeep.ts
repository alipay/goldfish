import watch, { IWatchOptions } from './watch';
import { ChangeOptions } from './dep';
import { isObject } from '@goldfishjs/utils';
import isRaw from './isRaw';

export interface IWatchDeepCallback {
  (obj: any, keyPathList: (string | number)[], newV: any, oldV: any, options?: ChangeOptions): void;
}

export interface IWatchDeepOptions extends Omit<IWatchOptions, 'deep'> {
  customWatch?: typeof watch;
  result?: any;
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

  private watchKey(
    curObj: any,
    curKey: string | number,
    keyPathList: (string | number)[],
    options?: IWatchDeepOptions,
  ) {
    const stopList: (() => void)[] = [];
    const baseWatch = options && options.customWatch || watch;
    const stop = baseWatch(
      () => {
        return curObj[curKey];
      },
      (newV, oldV, watchCallbackOptions) => {
        this.callback && this.callback(
          this.obj,
          [...keyPathList, curKey],
          newV,
          oldV,
          watchCallbackOptions,
        );

        // If the old value is an object, then clear all children watchers on it.
        if (isObject(oldV)) {
          stopList.forEach(s => s());
          stopList.splice(0, stopList.length);
        }

        // If the new value is an object, then set watchers on it's children.
        if (Array.isArray(newV)) {
          newV.forEach((item, index) => {
            const lowerStopList = this.watchKey(
              newV,
              index,
              [...keyPathList, curKey],
              options,
            );
            stopList.push(...lowerStopList);
          });
        } else if (isObject(newV)) {
          for (const k in newV) {
            const lowerStopList = this.watchKey(
              newV,
              k,
              [...keyPathList, curKey],
              options,
            );
            stopList.push(...lowerStopList);
          }
        }
      },
      {
        ...options,
        immediate: false,
      },
    );

    if (!isRaw(curObj[curKey])) {
      if (Array.isArray(curObj[curKey])) {
        curObj[curKey].forEach((_: any, index: number) => {
          const lowerStopList = this.watchKey(curObj[curKey], index, [...keyPathList, curKey], options);
          stopList.push(...lowerStopList);
        });
      } else if (isObject(curObj[curKey])) {
        for (const k in curObj[curKey]) {
          const lowerStopList = this.watchKey(curObj[curKey], k, [...keyPathList, curKey], options);
          stopList.push(...lowerStopList);
        }
      }
    }

    return [
      stop,
      ...stopList,
    ];
  }

  private watchDeep(obj: Record<string, any>) {
    if (isRaw(obj)) {
      return [];
    }

    const stopList: (() => void)[] = [];
    for (const k in obj) {
      const lowerStopList = this.watchKey(
        obj,
        k,
        [],
        this.options,
      );
      stopList.push(...lowerStopList);

      if (this.options && this.options.immediate) {
        Promise.resolve().then(
          () => {
            this.callback && this.callback(
              this.obj,
              [k],
              obj[k],
              undefined,
              undefined,
            );
          },
        );
      }
    }

    return stopList;
  }

  public watch() {
    return this.watchDeep(this.obj);
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
