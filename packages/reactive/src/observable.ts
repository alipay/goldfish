/* eslint-disable @typescript-eslint/no-use-before-define */
import { isObject, silent, deepVisit, DeepVisitBreak } from '@goldfishjs/utils';
import { getCurrent, Dep, ChangeOptions } from './dep';
import { genId, isArray } from './utils';
import silentValue, { isSilentValue } from './silentValue';

type ObservableBaseTypes = null | undefined | string | number | boolean;
type ObservableArrayElement = ObservableBaseTypes | IObservableObject;
export type ObservableArray = ObservableArrayElement[];
export interface IObservableObject {
  [key: string]: IObservableObject | ObservableArray | ObservableBaseTypes;
}

const OBSERVE_FLAG = {};
const OBSERVE_KEY = '__reactive-ob__';

const NOTIFY_KEY = '__notify';

const UNOBSERVABLE_KEY = '__unobservable__';

export function isObservable(obj: any) {
  return obj && Object.prototype.hasOwnProperty.call(obj, OBSERVE_KEY) && obj[OBSERVE_KEY] === OBSERVE_FLAG;
}

export function definePropertySilently(...args: Parameters<typeof Object['defineProperty']>) {
  silent(() => {
    Object.defineProperty(...args);
  })();
}

export function markObservable(data: any) {
  if (isObject(data) && data[OBSERVE_KEY] !== OBSERVE_FLAG) {
    definePropertySilently(data, OBSERVE_KEY, {
      value: OBSERVE_FLAG,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }
}

export function markUnobservable(data: Array<any> | Record<string, any>) {
  if (!(UNOBSERVABLE_KEY in data)) {
    definePropertySilently(data, UNOBSERVABLE_KEY, {
      value: true,
      configurable: false,
      enumerable: false,
      writable: true,
    });
  } else {
    data[UNOBSERVABLE_KEY] = true;
  }
}

export function unmarkUnobservable(data: Array<any> | Record<string, any>) {
  if (UNOBSERVABLE_KEY in data) {
    data[UNOBSERVABLE_KEY] = false;
  }
}

export function isMarkedUnobservable(data: Array<any> | Record<string, any>) {
  return (data as any)[UNOBSERVABLE_KEY] === true;
}

// 改写 Array 相关方法
export type Methods = 'push' | 'splice' | 'unshift' | 'pop' | 'sort' | 'reverse' | 'shift';
const methods: Methods[] = ['push', 'splice', 'unshift', 'pop', 'sort', 'reverse', 'shift'];
methods.forEach(methodName => {
  const oldMethod = Array.prototype[methodName] as Function;
  /* eslint-disable no-extend-native */
  Array.prototype[methodName] = function (this: any[], ...args: any[]) {
    const originLength = this.length;
    const oldV = this.slice(0);
    const result = oldMethod.apply(this, args);

    if (isObservable(this)) {
      if (originLength < this.length) {
        for (let i = originLength; i < this.length; i += 1) {
          defineProperty(this, i);
          isObject(this[i]) && createObserver(this[i]);
        }
      }

      callNotifyFns(this, this, this, {
        args,
        result,
        oldV,
        isArray: true,
        method: methodName,
      });
    }

    return result;
  };
  /* eslint-enable no-extend-native */
});

function defineNotify(value: any, dep: Dep, notifyId: string) {
  if (isObject(value)) {
    if (!(value as any)[NOTIFY_KEY]) {
      definePropertySilently(value, NOTIFY_KEY, {
        configurable: true,
        enumerable: false,
        writable: false,
        value: {},
      });
    }

    const notifyFns = (value as any)[NOTIFY_KEY];
    if (notifyFns) {
      const notifyFn = (n: any, o: any, options?: Partial<ChangeOptions>) => {
        dep.notifyChange(n, o, {
          type: 'notify',
          ...(options || {}),
        });
      };
      notifyFns[notifyId] = notifyFn;
    }
  }
}

function removeNotify(value: any, notifyId: string) {
  if (isObject(value)) {
    const notifyFns = (value as any)[NOTIFY_KEY];
    if (notifyFns) {
      notifyFns[notifyId] = null;
    }
  }
}

function callNotifyFns(value: any, ...args: any[]) {
  if (isObject(value)) {
    const notifyFns = (value as any)[NOTIFY_KEY];
    if (notifyFns) {
      for (const key in notifyFns) {
        if (notifyFns[key]) {
          notifyFns[key](...args);
        }
      }
    }
  }
}

function defineProperty(obj: IObservableObject, key: string): void;
function defineProperty(obj: ObservableArray, key: number): void;
function defineProperty(obj: any, key: any) {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  // Do not modify the un-configurable properties and `getter/setter` properties.
  if (desc && (!desc.configurable || desc.get)) {
    return;
  }

  let value = obj[key];
  const dep = new Dep(obj, key);
  const notifyId = genId(`notify-${key}-`);
  defineNotify(value, dep, notifyId);
  definePropertySilently(obj, key, {
    configurable: typeof key === 'number',
    enumerable: true,
    get() {
      const currentDepList = getCurrent();
      if (currentDepList) {
        currentDepList.add(dep);
      }

      return isSilentValue(value) ? value.value : value;
    },
    set(v) {
      if (isObject(v)) {
        createObserver(v);
      }
      const newValue = v;
      const oldValue = value;
      value = v;

      if (oldValue !== value && isObject(oldValue)) {
        removeNotify(oldValue, notifyId);
      }
      defineNotify(value, dep, notifyId);

      if (!isSilentValue(v)) {
        dep.notifyChange(newValue, oldValue);
      }
    },
  });
}

function createObserver(obj: IObservableObject | ObservableArray) {
  if (isObservable(obj) || isMarkedUnobservable(obj)) {
    return;
  }

  const visitKeyPathDeepRecords: boolean[] = [];
  deepVisit(obj, (value, key, po, keyPathList) => {
    if (!visitKeyPathDeepRecords[keyPathList.length]) {
      visitKeyPathDeepRecords[keyPathList.length] = true;
      if (isObservable(po) || isMarkedUnobservable(po)) {
        return DeepVisitBreak.CHILDREN;
      }

      markObservable(po);
    }
    defineProperty(po as any, key as any);

    // We should mark the empty array or object to be observable in children.
    if ((isArray(value) && value.length === 0) || (isObject(value) && Object.keys(value).length === 0)) {
      markObservable(value);
    }

    return DeepVisitBreak.NO;
  });

  // If there is no elements in an object,
  // we should also change it to an observable object.
  if (!visitKeyPathDeepRecords[0]) {
    markObservable(obj);
  }
}

export function set(obj: ObservableArray, name: number, value: any, options?: { silent?: boolean }): void;
export function set(obj: IObservableObject, name: string, value: any, options?: { silent?: boolean }): void;
export function set(obj: any, name: any, value: any, options?: { silent?: boolean }) {
  if (!isObservable(obj)) {
    obj[name] = value;
    return;
  }

  const silent = (options && options.silent) || false;

  if (!Object.prototype.hasOwnProperty.call(obj, name)) {
    defineProperty(obj, name);
    isObject(obj[name]) && createObserver(obj[name]);
    obj[name] = silent ? silentValue(value) : value;
    callNotifyFns(obj, obj, obj);
  } else {
    obj[name] = silent ? silentValue(value) : value;
  }
}

export default function observable<T extends IObservableObject>(obj: T): { [K in keyof T]: T[K] } {
  createObserver(obj);
  return obj;
}
