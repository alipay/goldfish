import {
  ChangeOptions,
  generateKeyPathString,
  set as reactiveSet,
  Methods,
} from '@goldfishjs/reactive';

export default class MiniDataSetter<
  V extends tinyapp.IPageInstance<any> | tinyapp.IComponentInstance<any, any>
> {
  private view: V;

  private updateList: (() => void)[] = [];

  public constructor(view: V) {
    this.view = view;
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

  public async set(
    keyPathList: (string | number)[],
    newV: any,
    oldV: any,
    options?: ChangeOptions,
  ) {
    this.updateList.push(() => {
      try {
        const keyPathString = generateKeyPathString(keyPathList);
        if (Array.isArray(newV) && Array.isArray(oldV) && options && options.method) {
          const methodName: Methods = options && options.method;
          const args = options && options.args!;
          const optionsOldV = options && options.oldV!;
          this.setByKeyPathList(this.view.data, keyPathList, options.oldV);

          const map: Record<string, any> = {
            push: [optionsOldV.length, 0, ...args],
            splice: args,
            unshift: [0, 0, ...args],
            pop: [optionsOldV.length - 1, 1],
            shift: [0, 1],
          };
          const spliceDataArgs = map[methodName];

          if (spliceDataArgs) {
            this.view.$spliceData({
              [keyPathString]: spliceDataArgs,
            });
          } else {
            this.view.setData({
              [keyPathString]: newV,
            });
          }
        } else {
          this.view.setData({
            [keyPathString]: newV,
          });
        }
      } catch (e) {
        this.view.setData({
          [keyPathList[0]]: this.view.data[keyPathList[0]],
        });
        console.warn(e);
      }
    });
    await Promise.resolve();

    const store = (this.view as any).store;
    const isSyncDataSafe = store && store.isSyncDataSafe === false ? false : true;
    if (!isSyncDataSafe) {
      return;
    }

    // Component Store needs $page.$batchedUpdates
    (
      this.view.$batchedUpdates ?
      this.view.$batchedUpdates.bind(this.view) :
      this.view.$page.$batchedUpdates.bind(this.view.$page)
    )(() => {
      this.updateList.forEach(update => update());
      this.updateList = [];
    });
  }
}
