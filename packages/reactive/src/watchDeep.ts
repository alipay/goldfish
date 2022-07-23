import { isObject, deepVisit, DeepVisitBreak } from '@goldfishjs/utils';
import { IWatchOptions } from './watch';
import { ChangeOptions, getCurrent, call } from './dep';
import generateKeyPathString from './generateKeyPathString';
import { isMarkedUnobservable } from './observable';

export interface IWatchDeepCallback {
  (obj: any, keyPathList: (string | number)[], newV: any, oldV: any, options?: ChangeOptions): void;
}

export interface IWatchDeepOptions extends Omit<IWatchOptions, 'deep'> {
  result?: any;
}

type KeyPathList = {
  raw: (string | number)[];
  str: string;
};

function hasOwnProperty(obj: any, property: string | number) {
  return Object.prototype.hasOwnProperty.call(obj, property);
}

class StopFns {
  private fns: Record<string, any> = {};

  private stopFnKey = '__stop_fn_key__';

  public add(keyPathList: KeyPathList, curKey: string | number, fn: () => void) {
    let currentFns = this.fns;
    for (let i = 0, il = keyPathList.raw.length; i < il; i += 1) {
      if (!hasOwnProperty(currentFns, keyPathList.raw[i])) {
        currentFns[keyPathList.raw[i]] = typeof keyPathList.raw[i] === 'number' ? [] : {};
      }
      currentFns = currentFns[keyPathList.raw[i]];
    }

    if (!currentFns[this.stopFnKey]) {
      currentFns[this.stopFnKey] = {};
    }
    if (
      hasOwnProperty(currentFns[this.stopFnKey], curKey) &&
      typeof currentFns[this.stopFnKey][curKey] === 'function'
    ) {
      throw new Error(`Duplicate stop function for key: ${generateKeyPathString([curKey], keyPathList.str)}`);
    }
    currentFns[this.stopFnKey][curKey] = fn;
  }

  private callStopFns(currentFns: Record<string, any>) {
    const call = (obj: Record<string, any>) => {
      if (obj[this.stopFnKey]) {
        for (const key in obj[this.stopFnKey]) {
          obj[this.stopFnKey][key] && obj[this.stopFnKey][key]();
        }
      }
    };

    call(currentFns);

    deepVisit(currentFns, (...args) => {
      call(args[2]);
      return DeepVisitBreak.NO;
    });
  }

  /**
   * Remove current layer and all the children's listeners.
   *
   * @param keyPathList
   */
  public remove(keyPathList: KeyPathList) {
    let currentFns = this.fns;
    for (let i = 0, il = keyPathList.raw.length; i < il; i += 1) {
      if (!currentFns[keyPathList.raw[i]]) {
        return;
      }
      currentFns = currentFns[keyPathList.raw[i]];
    }

    if (!currentFns || !currentFns[this.stopFnKey]) {
      return;
    }

    this.callStopFns(currentFns);

    // Remove current layer stop functions.
    currentFns[this.stopFnKey] = {};

    // Remove the children's stop functions.
    for (const k in currentFns) {
      if (k === this.stopFnKey) {
        continue;
      }
      currentFns[k] = Array.isArray(currentFns[k]) ? [] : {};
    }
  }

  public removeChildren(keyPathList: KeyPathList) {
    let currentFns = this.fns;
    for (let i = 0, il = keyPathList.raw.length; i < il; i += 1) {
      if (!currentFns[keyPathList.raw[i]]) {
        return;
      }
      currentFns = currentFns[keyPathList.raw[i]];
    }

    // Remove the children's stop functions.
    for (const k in currentFns) {
      if (k === this.stopFnKey) {
        continue;
      }
      this.callStopFns(currentFns[k]);
      currentFns[k] = Array.isArray(currentFns[k]) ? [] : {};
    }
  }

  public removeSingleLayer(keyPathList: KeyPathList) {
    let currentFns = this.fns;
    for (let i = 0, il = keyPathList.raw.length; i < il; i += 1) {
      if (!currentFns[keyPathList.raw[i]]) {
        return;
      }
      currentFns = currentFns[keyPathList.raw[i]];
    }

    // Remove current layer stop functions.
    if (currentFns && currentFns[this.stopFnKey]) {
      for (const k in currentFns[this.stopFnKey]) {
        currentFns[this.stopFnKey][k] && currentFns[this.stopFnKey][k]();
      }
      currentFns[this.stopFnKey] = {};
    }
  }

  private callAll() {
    this.callStopFns(this.fns);
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

  private watchObj(obj: any, keyPathList: KeyPathList, options?: ChangeOptions) {
    if (isObject(obj) && isMarkedUnobservable(obj)) {
      return;
    }

    if (Array.isArray(obj)) {
      // Optimization for arrays.
      if (options?.isArray) {
        const method = options.method!;
        const oldV = options.oldV!;
        const args = options.args!;

        if (method === 'sort' || method === 'reverse') {
          for (let i = 0, il = obj.length; i < il; i++) {
            this.stopFns.removeChildren({
              raw: [...keyPathList.raw, i],
              str: generateKeyPathString([i], keyPathList.str),
            });
            this.watchSingleKey(obj, i, keyPathList);
          }
        } else {
          const start = {
            push: oldV.length,
            splice: args[0],
            unshift: 0,
            pop: oldV.length - 1,
            shift: 0,
          }[method];
          const deletedCount = {
            push: 0,
            splice: args[1],
            unshift: 0,
            pop: 1,
            shift: 1,
          }[method];
          const values = {
            push: args,
            splice: args.slice(2),
            unshift: args,
            pop: [],
            shift: [],
          }[method];

          if (deletedCount === values.length) {
            for (let i = start, il = deletedCount; i < il; i++) {
              this.stopFns.removeChildren({
                raw: [...keyPathList.raw, i],
                str: generateKeyPathString([i], keyPathList.str),
              });
              this.watchSingleKey(obj, i, keyPathList);
            }
          } else {
            for (let i = start, il = oldV.length; i < il; i++) {
              const newKeyPathList = {
                raw: [...keyPathList.raw, i],
                str: generateKeyPathString([i], keyPathList.str),
              };
              this.stopFns.removeChildren(newKeyPathList);
              this.watchObj(obj[i], newKeyPathList);
            }
            for (let i = oldV.length, il = obj.length; i < il; i++) {
              this.watchSingleKey(obj, i, keyPathList);
            }
            for (let i = obj.length, il = oldV.length; i < il; i++) {
              const newKeyPathList = {
                raw: [...keyPathList.raw, i],
                str: generateKeyPathString([i], keyPathList.str),
              };
              this.stopFns.removeSingleLayer(newKeyPathList);
              this.stopFns.removeChildren(newKeyPathList);
            }
          }
        }
      } else {
        this.stopFns.remove(keyPathList);
        obj.forEach((_, index) => {
          this.watchSingleKey(obj, index, keyPathList);
        });
      }
    } else if (isObject(obj)) {
      this.stopFns.remove(keyPathList);
      for (const key in obj) {
        this.watchSingleKey(obj, key, keyPathList);
      }
    }
  }

  private watchCurrentKeyOnly(obj: any, key: string | number, keyPathList: KeyPathList) {
    const nextKeyPathList = { raw: [...keyPathList.raw, key], str: generateKeyPathString([key], keyPathList.str) };
    call(
      () => {
        /* eslint-disable @typescript-eslint/no-unused-expressions */
        obj[key];
        /* eslint-enable @typescript-eslint/no-unused-expressions */
        const stopList = getCurrent().addChangeListener((newV, oldV, options) => {
          this.watchObj(newV, nextKeyPathList, options);
          this.callback(this.obj, nextKeyPathList.raw, newV, oldV, options);
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
    return nextKeyPathList;
  }

  private watchSingleKey(obj: any, key: string | number, keyPathList: KeyPathList) {
    const nextKeyPathList = this.watchCurrentKeyOnly(obj, key, keyPathList);
    this.watchObj(obj[key], nextKeyPathList);
  }

  public watch() {
    if (this.options?.immediate) {
      this.callback(this.obj, [], this.obj, undefined);
    }
    return this.watchObj(this.obj, { raw: [], str: generateKeyPathString([]) });
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
