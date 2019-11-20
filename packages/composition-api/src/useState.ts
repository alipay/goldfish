import { observable as reactiveObservable, computed as reactiveComputed } from '@goldfishjs/reactive';
import checkSetupEnv from './checkSetupEnv';

export function reactive(obj: any) {
  for (const k in obj) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, k);
    if (!descriptor || (!descriptor.get && !descriptor.set)) {
      continue;
    }

    const getter = descriptor.get;
    const setter = descriptor.set;
    Object.defineProperty(obj, k, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {
        get: getter ? () => getter.call(obj) : undefined,
        set: setter ? (val: any) => setter.call(obj, val) : undefined,
      },
    });
  }
  reactiveComputed(obj);
  return reactiveObservable(obj);
}

export default function useState<T extends Record<string, any>>(val: T): T {
  checkSetupEnv('useState', ['app', 'component', 'page']);
  return reactive(val);
}
