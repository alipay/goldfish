import {
  ChangeOptions,
  generateKeyPathString,
  set as reactiveSet,
  Methods,
  isObservable,
} from '@goldfishjs/reactive';

function isObject(v: any) {
  return typeof v === 'object' && v !== null;
}

export class Batch {
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

type AncestorChildren = Record<string, (Ancestor | Leaf)> | (Ancestor | Leaf)[];

class Ancestor {
  public parent: Ancestor | undefined = undefined;

  public children: AncestorChildren | undefined = undefined;
}

class Leaf {
  public parent: Ancestor | undefined = undefined;

  public value: any;
}

class LimitLeafCounter {
  private limitLeafTotalCount = 100;

  private leafTotalCount = 0;

  public addLeaf() {
    this.leafTotalCount += 1;
  }

  public getRemainCount() {
    return this.limitLeafTotalCount - this.leafTotalCount;
  }
}

class UpdateTree {
  private root = new Ancestor();

  private view: View;

  private limitLeafTotalCount: LimitLeafCounter;

  public constructor(view: View, limitLeafTotalCount: LimitLeafCounter) {
    this.view = view;
    this.limitLeafTotalCount = limitLeafTotalCount;
  }

  public addNode(keyPathList: (string | number)[], value: any) {
    let curNode = this.root;
    const len = keyPathList.length;
    keyPathList.forEach((keyPath, index) => {
      if (curNode.children === undefined) {
        if (typeof keyPath === 'number') {
          curNode.children = [];
        } else {
          curNode.children = {};
        }
      }

      if (index < len - 1) {
        const child = (curNode.children as any)[keyPath];
        if (!child || child instanceof Leaf) {
          const node = new Ancestor();
          node.parent = curNode;
          (curNode.children as any)[keyPath] = node;
          curNode = node;
        } else {
          curNode = child;
        }
      } else {
        const lastLeafNode: Leaf = new Leaf();
        lastLeafNode.parent = curNode;
        lastLeafNode.value = value;
        (curNode.children as any)[keyPath] = lastLeafNode;
      }
    });
  }

  private getViewData(viewData: any, k: string | number) {
    return isObject(viewData) ? viewData[k] : null;
  }

  private combine(curNode: Ancestor | Leaf, viewData: any): any {
    if (curNode instanceof Leaf) {
      return curNode.value;
    }

    if (!curNode.children) {
      return undefined;
    }

    if (Array.isArray(curNode.children)) {
      return curNode.children.map((child, index) => {
        return this.combine(child, this.getViewData(viewData, index));
      });
    }

    const result: Record<string, any> = isObject(viewData) ? viewData : {};
    for (const k in curNode.children) {
      result[k] = this.combine(curNode.children[k], this.getViewData(viewData, k));
    }
    return result;
  }

  private iterate(
    curNode: Ancestor | Leaf,
    keyPathList: (string | number)[],
    updateObj: Record<string, any>,
    viewData: any,
    availableLeafCount: number,
  ) {
    if (curNode instanceof Leaf) {
      updateObj[generateKeyPathString(keyPathList)] = curNode.value;
      this.limitLeafTotalCount.addLeaf();
    } else {
      const children = curNode.children;
      const len = Array.isArray(children)
        ? children.length
        : Object.keys(children || {}).length;
      if (len > availableLeafCount) {
        updateObj[generateKeyPathString(keyPathList)] = this.combine(curNode, viewData);
        this.limitLeafTotalCount.addLeaf();
      } else if (Array.isArray(children)) {
        children.forEach((child, index) => {
          this.iterate(
            child,
            [
              ...keyPathList,
              index,
            ],
            updateObj,
            this.getViewData(viewData, index),
            this.limitLeafTotalCount.getRemainCount() - len,
          );
        });
      } else {
        for (const k in children) {
          this.iterate(
            children[k],
            [
              ...keyPathList,
              k,
            ],
            updateObj,
            this.getViewData(viewData, k),
            this.limitLeafTotalCount.getRemainCount() - len,
          );
        }
      }
    }
  }

  public generate() {
    const updateObj: Record<string, any> = {};
    this.iterate(
      this.root,
      [],
      updateObj,
      this.view.data,
      this.limitLeafTotalCount.getRemainCount(),
    );
    return updateObj;
  }

  public clear() {
    this.root = new Ancestor();
  }
}

class Updater {
  private list: (UpdateTree | Record<string, any>)[] = [];

  private limitLeafCounter = new LimitLeafCounter();

  public setSetObjectValue(view: View, keyPathList: (string | number)[], value: any) {
    let last = this.list[this.list.length - 1];
    if (!last || !(last instanceof UpdateTree)) {
      last = new UpdateTree(view, this.limitLeafCounter);
      this.list.push(last);
    }

    last.addNode(keyPathList, value);
  }

  public setSpliceObjectValue(keyPathList: (string | number)[] | string, args: any[]) {
    let last = this.list[this.list.length - 1];
    if (!last || last instanceof UpdateTree) {
      last = {};
      this.list.push(last);
    }

    const key = typeof keyPathList === 'string' ? keyPathList : generateKeyPathString(keyPathList);
    last[key] = args;
  }

  public iterate(fn: (type: 'set' | 'splice', obj: Record<string, any>) => void) {
    this.list.forEach((item) => {
      if (item instanceof UpdateTree) {
        fn('set', item.generate());
      } else {
        fn('splice', item);
      }
    });
  }
}

type View = tinyapp.IPageInstance<any> | tinyapp.IComponentInstance<any, any>;

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
        updater.iterate((type, obj) => {
          if (type === 'set') {
            view.setData(obj);
          } else {
            view.$spliceData(obj);
          }
        });
      });
    }
    this.viewMap = {};
    this.updaterMap = {};
  }

  private setValue(obj: any, key: string | number, value: any) {
    if (isObservable(obj)) {
      reactiveSet(obj, key as any, value, { silent: true });
    } else {
      obj[key] = value;
    }
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
      // The last one.
      if (i === il - 1) {
        this.setValue(curObj, key, value);
        break;
      }

      if (!curObj[key] && i < il) {
        this.setValue(curObj, key, typeof key === 'number' ? [] : {});
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
    this.updaterMap[view.$id] = this.updaterMap[view.$id] || new Updater();
    this.viewMap[view.$id] = view;
    try {
      const keyPathString = generateKeyPathString(keyPathList);
      if (Array.isArray(newV) && Array.isArray(oldV)) {
        if (!options || !options.method) {
          // Use `splice` to update the whole array when there is an new array set.
          this.updaterMap[view.$id].setSpliceObjectValue(
            keyPathString,
            [0, oldV.length, ...newV],
          );
        } else {
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
            this.updaterMap[view.$id].setSpliceObjectValue(keyPathString, spliceDataArgs);
          } else {
            this.updaterMap[view.$id].setSetObjectValue(view, keyPathList, newV);
          }
        }
      } else {
        this.updaterMap[view.$id].setSetObjectValue(view, keyPathList, newV);
      }
    } catch (e) {
      this.updaterMap[view.$id].setSetObjectValue(
        view,
        [keyPathList[0]],
        view.data[keyPathList[0]],
      );
      console.warn(e);
    }

    this.count.set();
  }
}
