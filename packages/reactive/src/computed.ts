import { call, getCurrent, Dep, DepList } from './dep';
import { definePropertySilently, isMarkedUnobservable } from './observable';

type Getter = () => any;
type Setter = (v: any) => void;

type FullComputedValue = {
  get?: Getter;
  set?: Setter;
};
type ComputedValue = Getter | FullComputedValue;

export interface IComputedSource {
  [key: string]: ComputedValue;
}

const FLAG_KEY = '__reactive-cpt__';

function isGetter(x: any): x is Getter {
  return typeof x === 'function';
}

function isSetter(x: any): x is Setter {
  return typeof x === 'function';
}

function isFullComputedValue(x: any): x is FullComputedValue {
  return x !== null && typeof x === 'object' && (isGetter(x.get) || isSetter(x.set));
}

export function isComputed(obj: any) {
  return obj && Object.prototype.hasOwnProperty.call(obj, FLAG_KEY);
}

export default function computed<T extends IComputedSource>(obj: T): { [K in keyof T]: T[K] } {
  if (isComputed(obj) || isMarkedUnobservable(obj)) {
    return obj;
  }

  const depMap: Record<string, DepList> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const computedValue = obj[key];

    let setter: Setter | undefined;
    let getter: Getter | undefined;

    if (isGetter(computedValue)) {
      getter = computedValue;
    } else if (isFullComputedValue(computedValue)) {
      if (computedValue.get) {
        getter = computedValue.get;
      }
      if (computedValue.set) {
        setter = computedValue.set;
      }
    }

    if (!getter) {
      continue;
    }

    const realGetter = getter;

    let isDirty = true;
    let depList: DepList;
    let cachedValue: any;
    const dep = new Dep(obj, key);
    let removeListenersGroup: Function[][] = [];
    definePropertySilently(obj, key, {
      configurable: false,
      enumerable: true,
      get() {
        const outerDepList = getCurrent();
        if (outerDepList) {
          outerDepList.add(dep);
        }

        if (isDirty) {
          call(
            () => {
              cachedValue = realGetter();
              depList = getCurrent();
              depMap[key] = depList;

              removeListenersGroup.forEach(group => group.forEach(fn => fn()));
              removeListenersGroup = [];

              const removeFns = depList.addChangeListener(() => {
                isDirty = true;
                dep.notifyChange(undefined, cachedValue, {
                  type: 'computed',
                  isChanged: () => true,
                });
              }, false);
              isDirty = false;
              removeListenersGroup.push(removeFns);
            },
            error => {
              throw error;
            },
          );
        }

        return cachedValue;
      },
      set(v: any) {
        if (!setter) {
          throw new Error(`No setter provided for ${key}.`);
        }

        setter(v);
        dep.notifyChange(undefined, cachedValue, {
          type: 'computed',
        });
      },
    });
  }

  definePropertySilently(obj, FLAG_KEY, {
    value: depMap,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return obj;
}
