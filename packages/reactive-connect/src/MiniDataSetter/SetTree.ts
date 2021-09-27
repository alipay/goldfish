import { generateKeyPathString } from '@goldfishjs/reactive';
import { isObject, cloneDeep } from '@goldfishjs/utils';
import LimitLeafCounter from './LimitLeafCounter';
import * as keyPath from './keyPath';

export type View = tinyapp.IPageInstance<any> | tinyapp.IComponentInstance<any, any>;

type AncestorChildren = Record<string, Ancestor | Leaf> | (Ancestor | Leaf)[];

function getType(obj: any) {
  if (Array.isArray(obj)) {
    return 'array';
  }

  if (isObject(obj)) {
    return 'object';
  }

  return 'other';
}

class Ancestor {
  public parent: Ancestor | undefined = undefined;

  public children: AncestorChildren | undefined = undefined;
}

class Leaf {
  public parent: Ancestor | undefined = undefined;

  public value: any;
}

export default class SetTree {
  private root = new Ancestor();

  private limitLeafTotalCount: LimitLeafCounter;

  public constructor(limitLeafTotalCount: LimitLeafCounter) {
    this.limitLeafTotalCount = limitLeafTotalCount;
  }

  private setValue(obj: any, keyPathList: keyPath.KeyPathList, value: any) {
    let curObj = obj;
    for (let i = 0, il = keyPathList.length; i < il; i += 1) {
      if (i === il - 1) {
        curObj[keyPathList[i]] = value;
      } else {
        curObj[keyPathList[i]] = typeof keyPathList[i + 1] === 'number' ? [] : {};
        curObj = curObj[keyPathList[i]];
      }
    }
  }

  public addNode(keyPathString: string, passInValue: any) {
    const keyPathList = keyPath.get(keyPathString);
    // If the value is an array, we should copy it and maintain an new Array
    // to avoid confused mutable operations on both `view.data` and observable data;
    const value = Array.isArray(passInValue) ? passInValue.slice(0) : passInValue;

    let curNode = this.root;
    const len = keyPathList.length;
    keyPathList.some((keyPath, index) => {
      if (curNode.children === undefined) {
        if (typeof keyPath === 'number') {
          curNode.children = [];
        } else {
          curNode.children = {};
        }
      }

      if (index < len - 1) {
        const child = (curNode.children as any)[keyPath];
        if (!child) {
          const node = new Ancestor();
          node.parent = curNode;
          (curNode.children as any)[keyPath] = node;
          curNode = node;
        } else if (child instanceof Leaf) {
          this.setValue(child.value, keyPathList.slice(index + 1), cloneDeep(value));
          // Reach the leaf of the Tree, break.
          return true;
        } else {
          curNode = child;
        }
      } else {
        const lastLeafNode: Leaf = new Leaf();
        lastLeafNode.parent = curNode;
        lastLeafNode.value = cloneDeep(value);
        (curNode.children as any)[keyPath] = lastLeafNode;
      }
      return false;
    });
  }

  private getData(obj: any, k: string | number) {
    return isObject(obj) ? obj[k] : undefined;
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
        return this.combine(child, this.getData(viewData, index));
      });
    }

    const result: Record<string, any> = isObject(viewData) ? viewData : {};
    for (const k in curNode.children) {
      result[k] = this.combine(curNode.children[k], this.getData(viewData, k));
    }
    return result;
  }

  /**
   * Iterate the Tree, and apply the leaf limitation.
   *
   * @private
   * @param curNode Current traversed tree node.
   * @param keyPathList Current key path to location curNode.
   * @param updateObj The generated object to pass in `setData`.
   * @param obj The corresponding value in origin full object according to the keyPathList.
   * @param availableLeafCount The available leaf count.
   */
  private iterate(
    curNode: Ancestor | Leaf,
    keyPathList: (string | number)[],
    updateObj: Record<string, any>,
    obj: any,
    availableLeafCount: number,
  ) {
    if (curNode instanceof Leaf) {
      updateObj[generateKeyPathString(keyPathList)] = curNode.value;
      this.limitLeafTotalCount.addLeaf();
    } else {
      const children = curNode.children;
      // If the `children` is an array. we also use `Object.keys` to get the length of the array.
      // Because we should handle the sparse array.
      const len = Object.keys(children || {}).length;
      if (len > availableLeafCount) {
        updateObj[generateKeyPathString(keyPathList)] = this.combine(curNode, obj);
        this.limitLeafTotalCount.addLeaf();
      } else if (Array.isArray(children)) {
        children.forEach((child, index) => {
          const originObj = this.getData(obj, index);
          if (!(child instanceof Leaf) && index in obj && getType(child.children) !== getType(originObj)) {
            throw new Error(`Expect the origin value is an Array, but it is: ${JSON.stringify(originObj)}.`);
          }

          this.iterate(
            child,
            [...keyPathList, index],
            updateObj,
            originObj,
            this.limitLeafTotalCount.getRemainCount() - len,
          );
        });
      } else {
        for (const k in children) {
          const originObj = this.getData(obj, k);
          const child = children[k];
          if (!(child instanceof Leaf) && k in obj && getType(child.children) !== getType(originObj)) {
            throw new Error(`Expect the origin value is an Object, but it is: ${JSON.stringify(originObj)}.`);
          }

          this.iterate(
            child,
            [...keyPathList, k],
            updateObj,
            originObj,
            this.limitLeafTotalCount.getRemainCount() - len,
          );
        }
      }
    }
  }

  public generate(obj: any) {
    const updateObj: Record<string, any> = {};
    this.iterate(this.root, [], updateObj, obj, this.limitLeafTotalCount.getRemainCount());
    return updateObj;
  }

  public clear() {
    this.root = new Ancestor();
  }
}
