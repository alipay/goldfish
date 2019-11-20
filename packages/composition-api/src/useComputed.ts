import { IComputedSource, computed as reactiveComputed } from '@goldfishjs/reactive';

export default function useComputed<T extends Record<string, any>>(val: T): T {
  const obj: IComputedSource = {};
  for (const k in val) {
    const descriptor = Object.getOwnPropertyDescriptor(val, k);
    if (!descriptor || (!descriptor.get && !descriptor.set)) {
      descriptor && Object.defineProperty(obj, k, descriptor);
      continue;
    }

    const getter = descriptor.get;
    const setter = descriptor.set;
    obj[k] = {
      get: getter ? () => getter.call(obj) : undefined,
      set: setter ? (val: any) => setter.call(obj, val) : undefined,
    };
  }

  return reactiveComputed(obj) as any;
}
