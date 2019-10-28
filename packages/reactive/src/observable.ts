import { getCurrent, Dep } from './dep';
import { isObject, isArray } from './utils';

type ObservableBaseTypes = null | undefined | string | number | boolean;
type ObservableArrayElement = ObservableBaseTypes | IObservableObject;
export type ObservableArray = ObservableArrayElement[];
export interface IObservableObject {
  [key: string]: IObservableObject | ObservableArray | ObservableBaseTypes;
}

const OBSERVE_FLAG = {};
const OBSERVE_KEY = '__reactive-ob__';

export function isObservable(obj: any) {
  return obj
    && Object.prototype.hasOwnProperty.call(obj, OBSERVE_KEY)
    && obj[OBSERVE_KEY] === OBSERVE_FLAG;
}

export function markObservable(obj: any) {
  if (isObject(obj) && obj[OBSERVE_KEY] !== OBSERVE_FLAG) {
    Object.defineProperty(obj, OBSERVE_KEY, {
      value: OBSERVE_FLAG,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }
}

// 改写 Array 相关方法
type Methods = 'push' | 'splice' | 'unshift' | 'pop' | 'sort' | 'reverse' | 'shift';
const methods: Methods[] = ['push', 'splice', 'unshift', 'pop', 'sort', 'reverse', 'shift'];
methods.forEach((methodName) => {
  const oldMethod = Array.prototype[methodName] as Function;
  Array.prototype[methodName] = function (this: any[], ...args: any[]) {
    const originLength = this.length;
    const result = oldMethod.call(this, ...args);

    if (isObservable(this)) {
      if (originLength < this.length) {
        for (let i = originLength; i < this.length; i += 1) {
          defineProperty(this, i);
        }
      }

      const notify = (this as any).__notify;
      if (notify) {
        notify(this, this);
      }
    }

    return result;
  };
});

function defineProperty(obj: IObservableObject, key: string): void;
function defineProperty(obj: ObservableArray, key: number): void;
function defineProperty(obj: any, key: any) {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  // 不要去动无法配置的属性
  if (desc && !desc.configurable) {
    return;
  }

  let value = obj[key];
  const dep = new Dep(obj, key);
  Object.defineProperty(obj, key, {
    configurable: typeof key === 'number',
    enumerable: true,
    get() {
      const currentDepList = getCurrent();
      if (currentDepList) {
        currentDepList.add(dep);

        if (isObject(value)) {
          Object.defineProperty(value, '__notify', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: (n: any, o: any) => {
              dep.notifyChange(n, o, 'notify');
            },
          });
        }
      }

      return value;
    },
    set(v) {
      if (isObject(v)) {
        createObserver(v);
      }
      const newValue = v;
      const oldValue = value;
      value = v;

      dep.notifyChange(newValue, oldValue);
    },
  });

  if (isObject(value)) {
    createObserver(value);
  }
}

function createObserver(obj: IObservableObject | ObservableArray) {
  if (isObservable(obj)) {
    return;
  }

  if (isArray(obj)) {
    for (let i = 0, il = obj.length; i < il; i += 1) {
      defineProperty(obj, i);
    }
  } else {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }

      defineProperty(obj, key);
    }
  }

  markObservable(obj);
}

export function set(obj: IObservableObject, name: string, value: any) {
  if (!Object.prototype.hasOwnProperty.call(obj, name)) {
    defineProperty(obj, name);
    const notify = (obj as any).__notify;
    if (notify) {
      notify(obj, obj);
    }
    return;
  }

  obj[name] = value;
}

export default function observable<T extends IObservableObject>(obj: T): { [K in keyof T]: T[K] } {
  createObserver(obj);
  return obj;
}
