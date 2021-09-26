import isObject from '@goldfishjs/utils/lib/isObject';
import generateKeyPathString from '@goldfishjs/reactive/lib/generateKeyPathString';

interface ISetOperation {
  type: 'set';
  value: Record<string, any>;
}

interface ISpliceOperation {
  type: 'splice';
  keyPathString: string;
  start: number;
  deleteCount: number;
  values: any[];
}

export type Operation = ISetOperation | ISpliceOperation;

class Updater {
  operations: Operation[] = [];

  set(keyPathList: Array<string | number>, value: any) {
    const keyPathString = generateKeyPathString(keyPathList);
    const lastOperation = this.operations[this.operations.length - 1];
    if (!lastOperation || lastOperation.type !== 'set') {
      this.operations.push({
        type: 'set',
        value: {
          [keyPathString]: value,
        },
      });
    } else {
      lastOperation.value[keyPathString] = value;
    }
  }

  splice(keyPathList: Array<string | number>, start: number, deleteCount: number, values: any[]) {
    const keyPathString = generateKeyPathString(keyPathList);

    const lastOperation = this.operations[this.operations.length - 1];
    if (
      lastOperation &&
      lastOperation.type === 'splice' &&
      lastOperation.keyPathString === keyPathString &&
      ((lastOperation.deleteCount === 0 && lastOperation.start + lastOperation.values.length === start) ||
        (lastOperation.deleteCount !== 0 &&
          lastOperation.start - lastOperation.deleteCount + lastOperation.values.length + 1 === start))
    ) {
      lastOperation.deleteCount += deleteCount;
      lastOperation.values.push(...values);
    } else {
      this.operations.push({
        type: 'splice',
        keyPathString,
        start,
        deleteCount,
        values,
      });
    }
  }

  generate() {
    return this.operations;
  }
}

function isSet(value: any): value is Set<any> {
  return typeof Set === 'function' && value instanceof Set;
}

function run(oldValue: any, newValue: any, updater: Updater, keyPathList: Array<string | number> = []) {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    // Traverse the shorter array.
    // Use the `forEach` method to handle the sparse array.
    (oldValue.length < newValue.length ? oldValue : newValue).forEach((_, index) => {
      run(oldValue[index], newValue[index], updater, [...keyPathList, index]);
    });

    if (oldValue.length < newValue.length) {
      newValue.slice(oldValue.length).forEach((current, index) => {
        updater.splice(keyPathList, index + oldValue.length, 0, [current]);
      });
    } else if (oldValue.length > newValue.length) {
      updater.splice(keyPathList, newValue.length, oldValue.length - newValue.length, []);
    }
    return;
  }

  if (isSet(oldValue) || isSet(newValue)) {
    updater.set(keyPathList, newValue);
    return;
  }

  if (isObject(oldValue) && isObject(newValue)) {
    const visitedKeyMap: Record<string, boolean> = {};
    for (const k in oldValue) {
      visitedKeyMap[k] = true;
      run(oldValue[k], newValue[k], updater, [...keyPathList, k]);
    }

    for (const k in newValue) {
      if (visitedKeyMap[k]) {
        continue;
      }
      run(oldValue[k], newValue[k], updater, [...keyPathList, k]);
    }
    return;
  }

  if (oldValue !== newValue) {
    const lastKeyPath = keyPathList[keyPathList.length - 1];
    if (typeof lastKeyPath === 'number') {
      updater.splice(keyPathList.slice(0, -1), lastKeyPath, 1, [newValue]);
    } else {
      updater.set(keyPathList, newValue);
    }
  }
}

export default function diff(oldValue: any, newValue: any) {
  const updater = new Updater();
  run(oldValue, newValue, updater);
  return updater.generate();
}
