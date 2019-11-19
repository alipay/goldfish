import { IComputedSource, computed as reactiveComputed } from '@goldfishjs/reactive';

const computedFlag = {};

export function isComputed(val: any) {
  return val && typeof val === 'object' && val.__type__ === computedFlag;
}

export default function useComputed<T extends Record<string, any>>(val: T): T {
  const obj: IComputedSource = {};
  for (const k in val) {
    const descriptor = Object.getOwnPropertyDescriptor(val, k);
    if (!descriptor || (!descriptor.get && !descriptor.set)) {
      throw new Error(`The property is not an accessor: ${k}.`);
    }

    const getter = descriptor.get;
    const setter = descriptor.set;
    obj[k] = {
      get: getter ? () => getter.call(obj) : undefined,
      set: setter ? (val: any) => setter.call(obj, val) : undefined,
    };
  }

  Object.defineProperty(obj, '__type__', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: computedFlag,
  });
  return reactiveComputed(obj) as any;
}
