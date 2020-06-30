import { observable, computed } from '@goldfishjs/reactive';

export default function reactive(obj: any): any {
  for (const k in obj) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, k);

    if (descriptor && !descriptor.get && !descriptor.set && typeof obj[k] === 'function') {
      throw new Error(`Do not put function to the reactive object: ${k}.`);
    }

    if (!descriptor || (!descriptor.get && !descriptor.set)) {
      continue;
    }

    const getter = descriptor.get;
    const setter = descriptor.set;
    Object.defineProperty(obj, k, {
      configurable: true,
      enumerable: true,
      value: {
        get: getter ? () => getter.call(obj) : undefined,
        set: setter ? (val: any) => setter.call(obj, val) : undefined,
      },
    });
  }
  computed(obj);
  return observable(obj);
}
