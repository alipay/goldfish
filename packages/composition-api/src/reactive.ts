import { observable, computed } from '@goldfishjs/reactive';

export default function reactive<T extends Record<string, any>>(obj: T): T {
  const base = {};
  const derive = {};
  for (const k in obj) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, k);

    if (descriptor && !descriptor.get && !descriptor.set && typeof obj[k] === 'function') {
      throw new Error(`Do not put function to the reactive object: ${k}.`);
    }

    if (!descriptor || (!descriptor.get && !descriptor.set)) {
      descriptor && Object.defineProperty(base, k, descriptor);
      continue;
    }

    const getter = descriptor.get;
    const setter = descriptor.set;
    Object.defineProperty(derive, k, {
      configurable: true,
      enumerable: true,
      value: {
        get: getter ? () => getter.call(base) : undefined,
        set: setter ? (val: any) => setter.call(base, val) : undefined,
      },
    });
  }

  observable(base);
  computed(derive);

  for (const k in derive) {
    const desc = Object.getOwnPropertyDescriptor(derive, k);
    desc && Object.defineProperty(base, k, desc);
  }

  return base as any;
}
