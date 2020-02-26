import Batch from './Batch';
import { View } from './SetTree';
import Updater from './Updater';
import {
  ChangeOptions,
} from '@goldfishjs/reactive';
import * as keyPath from './keyPath';
import { Methods as ModifyArrayMethods } from './SpliceTree';

function isModifyArrayMethod(m: string): m is ModifyArrayMethods {
  return ['push', 'splice', 'unshift', 'pop', 'shift'].indexOf(m) !== -1;
}

export default class MiniDataSetter {
  private count = new Batch(() => this.flush());

  private viewMap: Record<string, View> = {};

  private updaterMap: Record<string, Updater> = {};

  private getBatchUpdates(view: View) {
    return view.$batchedUpdates ?
      view.$batchedUpdates.bind(view) :
      view.$page.$batchedUpdates.bind(view.$page);
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

  public set(
    view: View,
    fullObj: any,
    keyPathList: (string | number)[],
    newV: any,
    oldV: any,
    options?: ChangeOptions,
  ) {
    this.updaterMap[view.$id] = this.updaterMap[view.$id] || new Updater(fullObj);
    this.viewMap[view.$id] = view;

    const updater = this.updaterMap[view.$id];

    try {
      const keyPathString = keyPath.save(keyPathList);
      if (
        options?.isArray
        && options.method
        && isModifyArrayMethod(options.method)
      ) {
        updater.setSpliceObjectValue(
          keyPathString,
          options.method,
          options.args || [],
          options.oldV || [],
        );
      } else {
        updater.setSetObjectValue(keyPathString, newV);
      }
    } catch (e) {
      const rootKeyPathList = keyPathList.slice(0, 1);
      const rootKeyPathString = keyPath.save(rootKeyPathList);
      updater.setSetObjectValue(
        rootKeyPathString,
        fullObj[rootKeyPathString],
      );
      console.warn(e);
    }

    this.count.set();
  }
}
