import { default as Global, global } from './Global';

export default function useGlobalData<G extends Record<string, any>>(passInGlobal?: Global) {
  const realGlobal = passInGlobal || global;
  return {
    get: <T extends keyof G>(key: T) => {
      return realGlobal.reactiveData.data[key as string];
    },
    set: <T extends keyof G>(key: T, value: G[T]) => {
      if (key in realGlobal.reactiveData) {
        realGlobal.reactiveData.data[key as string] = value;
      } else {
        realGlobal.reactiveData.data = {
          ...global.reactiveData.data,
          [key]: value,
        };
      }
    },
  };
}
