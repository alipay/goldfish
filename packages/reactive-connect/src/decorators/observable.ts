import {
  observable as reactiveObservable,
  computed as reactiveComputed,
  markObservable as reactiveMarkObservable,
} from '@alipay/goldfish-reactive';
import STATE_KEY from './STATE_KEY';
import COMPUTED_KEY from './COMPUTED_KEY';
import { isOrigin, default as markState } from './state';

export default function observable(target: any) {
  class Observable extends target {
    public constructor(...args: any[]) {
      super(...args);

      const state: Record<string, any> = {};
      const computed: Record<string, any> = {};
      const ownKeys = Object.getOwnPropertyNames(this);

      this[STATE_KEY] = { ...this[STATE_KEY] };
      this[COMPUTED_KEY] = { ...this[COMPUTED_KEY] };

      // 将标记好的响应式属性融合到统一的地方。
      ownKeys.forEach((key) => {
        if (
          !(key in this[COMPUTED_KEY])
          && !(key in this[STATE_KEY])
          && this[key]
          && typeof this[key] === 'object'
        ) {
          if (this[key][STATE_KEY] === 'reactive') {
            markState(this, key);
            this[key] = this[key].value;
          } else if (this[key][COMPUTED_KEY] === 'reactive') {
            this[COMPUTED_KEY][key] = this[key].value;
          }
        }
      });

      const stateKeys = this[STATE_KEY];
      for (const k in stateKeys) {
        if (isOrigin(stateKeys[k])) {
          state[k] = this[k];
        } else {
          state[k] = stateKeys[k];
        }

        Object.defineProperty(this, k, {
          get: () => {
            return state[k];
          },
          set: (v: any) => {
            state[k] = v;
          },
          configurable: true,
        });
      }

      const computedKeys = this[COMPUTED_KEY];
      for (const k in computedKeys) {
        const descriptor = computedKeys[k];
        computed[k] = {
          get: () => {
            if (typeof descriptor === 'function') {
              return descriptor.call(this);
            }
            return descriptor.get.call(this);
          },
          set: (v: any) => {
            descriptor.set.call(this, v);
          },
        };

        Object.defineProperty(this, k, {
          get: () => {
            return computed[k];
          },
          set: (v: any) => {
            computed[k] = v;
          },
          configurable: true,
          enumerable: true,
        });
      }

      reactiveObservable(state);
      reactiveComputed(computed);

      reactiveMarkObservable(this);
    }
  }

  return Observable as any;
}
