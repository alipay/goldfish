import {
  ChangeOptions,
  generateKeyPathString,
  set as reactiveSet,
  Methods,
} from '@goldfishjs/reactive';

export class Count {
  private segTotalList: number[] = [];

  private counter = 0;

  private cb: () => void;

  public constructor(cb: () => void) {
    this.cb = cb;
  }

  public async set() {
    const segIndex = this.counter === 0
      ? this.segTotalList.length
      : (this.segTotalList.length - 1);

    if (!this.segTotalList[segIndex]) {
      this.segTotalList[segIndex] = 0;
    }

    this.counter += 1;
    this.segTotalList[segIndex] += 1;

    await Promise.resolve();

    this.counter -= 1;

    // The last invoke of `set`
    if (this.counter === 0) {
      const segLength = this.segTotalList.length;
      await Promise.resolve();
      if (this.segTotalList.length === segLength) {
        this.cb();
        this.counter = 0;
        this.segTotalList = [];
      }
    }
  }
}

type View = tinyapp.IPageInstance<any> | tinyapp.IComponentInstance<any, any>;

export default class MiniDataSetter {
  private count = new Count(() => this.flush());

  private setDataObjectMap: Record<string, Record<string, any>> = {};

  private spliceDataObjectMap: Record<string, Record<string, any>> = {};

  private viewMap: Record<string, View> = {};

  private getBatchUpdates(view: View) {
    return view.$batchedUpdates ?
      view.$batchedUpdates.bind(view) :
      view.$page.$batchedUpdates.bind(view.$page);
  }

  private flush() {
    for (const id in this.viewMap) {
      const setDataObject = this.setDataObjectMap[id];
      const spliceDataObject = this.spliceDataObjectMap[id];
      const view = this.viewMap[id];

      const store = (view as any).store;
      const isSyncDataSafe = store && store.isSyncDataSafe === false ? false : true;
      if (!isSyncDataSafe) {
        continue;
      }

      this.getBatchUpdates(view)(() => {
        view.setData(setDataObject);
        view.$spliceData(spliceDataObject);
      });
    }
    this.viewMap = {};
    this.setDataObjectMap = {};
    this.spliceDataObjectMap = {};
  }

  private setByKeyPathList(
    obj: any,
    keyPathList: (string | number)[],
    value: any,
  ) {
    if (keyPathList.length === 0) {
      throw new TypeError('No key path.');
    }

    for (
      let i = 0, il = keyPathList.length, curObj = obj;
      true;
      i += 1
    ) {
      const key = keyPathList[i];
      if (i === il - 1) {
        reactiveSet(curObj, String(key), value, { silent: true });
        break;
      }

      if (!curObj[key] && i < il) {
        reactiveSet(curObj, String(key), {}, { silent: true });
        curObj[key] = {};
      }

      curObj = curObj[key];
    }
  }

  public set(
    view: View,
    keyPathList: (string | number)[],
    newV: any,
    oldV: any,
    options?: ChangeOptions,
  ) {
    this.spliceDataObjectMap[view.$id] = this.spliceDataObjectMap[view.$id] || {};
    this.setDataObjectMap[view.$id] = this.setDataObjectMap[view.$id] || {};
    this.viewMap[view.$id] = view;
    try {
      const keyPathString = generateKeyPathString(keyPathList);
      if (Array.isArray(newV) && Array.isArray(oldV) && options && options.method) {
        const methodName: Methods = options && options.method;
        const args = options && options.args!;
        const optionsOldV = options && options.oldV!;
        this.setByKeyPathList(view.data, keyPathList, options.oldV);

        const map: Record<string, any> = {
          push: [optionsOldV.length, 0, ...args],
          splice: args,
          unshift: [0, 0, ...args],
          pop: [optionsOldV.length - 1, 1],
          shift: [0, 1],
        };
        const spliceDataArgs = map[methodName];

        if (spliceDataArgs) {
          this.spliceDataObjectMap[view.$id][keyPathString] = spliceDataArgs;
        } else {
          this.setDataObjectMap[view.$id][keyPathString] = newV;
        }
      } else {
        this.setDataObjectMap[view.$id][keyPathString] = newV;
      }
    } catch (e) {
      this.setDataObjectMap[view.$id][keyPathList[0]] = view.data[keyPathList[0]];
      console.warn(e);
    }

    this.count.set();
  }
}
