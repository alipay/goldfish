import { ChangeOptions } from '@goldfishjs/reactive';
import { isObject } from '@goldfishjs/utils';
import Batch from './Batch';
import { View } from './SetTree';
import Updater from './Updater';
import * as keyPath from './keyPath';

type Methods = 'push' | 'splice' | 'unshift' | 'pop' | 'shift';
function isModifyArrayMethod(m: string): m is Methods {
  return ['push', 'splice', 'unshift', 'pop', 'shift'].indexOf(m) !== -1;
}

export default class MiniDataSetter {
  private count = new Batch(() => this.flush());

  private viewMap: Record<string, View> = {};

  private updaterMap: Record<string, Updater> = {};

  private getBatchUpdates(view: View) {
    return view.$batchedUpdates ? view.$batchedUpdates.bind(view) : view.$page.$batchedUpdates.bind(view.$page);
  }

  private flush() {
    for (const id in this.viewMap) {
      const updater = this.updaterMap[id];
      const view = this.viewMap[id];

      const store = (view as any).store;
      const isSyncDataSafe = store && store.isSyncDataSafe === false ? false : true;
      if (!isSyncDataSafe) {
        continue;
      }

      this.getBatchUpdates(view)(() => {
        updater.iterate(
          obj => {
            view.setData(obj);
          },
          list => {
            list.forEach(obj => {
              view.$spliceData(obj);
            });
          },
        );
      });
    }
    this.viewMap = {};
    this.updaterMap = {};
    keyPath.clear();
  }

  private getValue(obj: any, keyPathList: keyPath.KeyPathList): any {
    if (keyPathList.length === 0) {
      return obj;
    }

    return this.getValue(obj[keyPathList[0]], keyPathList.slice(1));
  }

  public set(
    view: View,
    fullObj: any,
    keyPathList: keyPath.KeyPathList,
    newV: any,
    oldV: any,
    options?: ChangeOptions,
  ) {
    if (options?.type === 'computed') {
      newV = this.getValue(fullObj, keyPathList);
    }

    if (!keyPathList.length && isObject(newV)) {
      for (const k in newV) {
        this.set(view, fullObj, [k], newV[k], isObject(oldV) ? oldV[k] : undefined, options);
      }
      return;
    }

    const viewId = view.$id === undefined ? view.$viewId : view.$id;
    this.updaterMap[viewId] = this.updaterMap[viewId] || new Updater(fullObj);
    this.viewMap[viewId] = view;

    const updater = this.updaterMap[viewId];

    try {
      const keyPathString = keyPath.save(keyPathList);
      if (options?.isArray && options.method && isModifyArrayMethod(options.method)) {
        const optionsOldV = options.oldV || [];
        updater.setSpliceObjectValue(keyPathString, newV, optionsOldV);
      } else {
        updater.setSetObjectValue(keyPathString, newV);
      }
    } catch (e) {
      const rootKeyPathList = keyPathList.slice(0, 1);
      const rootKeyPathString = keyPath.save(rootKeyPathList);
      updater.setSetObjectValue(rootKeyPathString, fullObj[rootKeyPathString]);
      console.warn(e);
    }

    this.count.set();
  }
}
