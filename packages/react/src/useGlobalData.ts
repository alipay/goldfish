import { useGlobalData as baseUseGlobalData } from '@goldfishjs/composition-api';
import useContextType from './useContextType';
import { global } from './Global';

function check(key: any) {
  if (!global.data) {
    throw new Error('The global data is not ready.');
  }

  if (!(key in global.data)) {
    throw new Error(`The key: ${key} is not in global data.`);
  }
}

export default function useGlobalData<G extends Record<string, any>>() {
  const type = useContextType();
  if (type === 'react') {
    return {
      get<T extends keyof G>(key: T) {
        check(key);
        return global.data[key] as G[T];
      },
      set<T extends keyof G>(key: T, value: G[T]) {
        check(key);
        global.data[key] = value;
      },
    };
  }

  return baseUseGlobalData<G>();
}
