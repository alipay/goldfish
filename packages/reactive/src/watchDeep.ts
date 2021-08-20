import { isObject } from '@goldfishjs/utils';
import { IWatchOptions } from './watch';
import { ChangeOptions, getCurrent, call } from './dep';
import isRaw from './isRaw';
import generateKeyPathString from './generateKeyPathString';

export interface IWatchDeepCallback {
  (obj: any, keyPathList: (string | number)[], newV: any, oldV: any, options?: ChangeOptions): void;
}

export interface IWatchDeepOptions extends Omit<IWatchOptions, 'deep'> {
  result?: any;
}

type KeyPathList = (string | number)[];

class StopFns {
  private fns: Record<string, Record<string, () => void>> = {};

  public add(keyPathList: KeyPathList, curKey: string | number, fn: () => void) {
    const keyPathString = generateKeyPathString(keyPathList);
    if (!this.fns[keyPathString]) {
      this.fns[keyPathString] = {};
    }

    if (this.fns[keyPathString][curKey]) {
      throw new Error(`Duplicate stop function for key: ${generateKeyPathString([...keyPathList, curKey])}`);
    }

    this.fns[keyPathString][curKey] = fn;
  }

  public remove(keyPathList: KeyPathList) {
    const keyPathString = generateKeyPathString(keyPathList);
    for (const kps in this.fns) {
      if (kps.indexOf(keyPathString) === 0) {
        for (const k in this.fns[kps]) {
          this.fns[kps][k]();
        }
        this.fns[kps] = {};
      }
    }
  }

  private callAll() {
    for (const k1 in this.fns) {
      for (const k2 in this.fns[k1]) {
        this.fns[k1][k2]();
      }
    }
  }

  public removeAll() {
    this.callAll();
    this.fns = {};
  }
}

class Watcher {
  private obj: any;

  private options?: IWatchDeepOptions;

  private callback: IWatchDeepCallback;

  private stopFns = new StopFns();

  public constructor(obj: any, callback: IWatchDeepCallback, options?: IWatchDeepOptions) {
    this.obj = obj;
    this.callback = callback;
    this.options = options;
  }

  private watchObj(obj: any, keyPathList: KeyPathList) {
    if (isRaw(obj)) {
      return;
    }

    this.stopFns.remove(keyPathList);
    if (Array.isArray(obj)) {
      obj.forEach((_, index) => {
        this.watchSingleKey(obj, index, keyPathList);
      });
    } else if (isObject(obj)) {
      for (const key in obj) {
        this.watchSingleKey(obj, key, keyPathList);
      }
    }
  }

  private watchSingleKey(obj: any, key: string | number, keyPathList: KeyPathList) {
    const nextKeyPathList = [...keyPathList, key];
    call(
      () => {
        /* eslint-disable @typescript-eslint/no-unused-expressions */
        obj[key];
        /* eslint-enable @typescript-eslint/no-unused-expressions */
        const stopList = getCurrent().addChangeListener((newV, oldV, options) => {
          this.watchObj(newV, nextKeyPathList);
          this.callback(this.obj, nextKeyPathList, newV, oldV, options);
        }, false);
        this.stopFns.add(keyPathList, key, () => stopList.forEach(s => s()));
      },
      e => {
        if (this.options?.onError) {
          this.options.onError(e);
        } else {
          throw e;
        }
      },
    );
    this.watchObj(obj[key], nextKeyPathList);
  }

  public watch() {
    if (this.options?.immediate) {
      this.callback(this.obj, [], this.obj, undefined);
    }
    return this.watchObj(this.obj, []);
  }

  public stop() {
    this.stopFns.removeAll();
  }
}

export default function watchDeep(obj: any, callback: IWatchDeepCallback, options?: IWatchDeepOptions) {
  const watcher = new Watcher(obj, callback, options);
  watcher.watch();
  return () => watcher.stop();
}
