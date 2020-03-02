import { default as App, app } from './App';

export default function useGlobalData<G extends Record<string, any>>(passInApp?: App) {
  const realGlobal = passInApp || app;
  return {
    get: <T extends keyof G>(key: T) => {
      return realGlobal.reactiveData.data[key as string];
    },
    set: <T extends keyof G>(key: T, value: G[T]) => {
      if (key in realGlobal.reactiveData) {
        realGlobal.reactiveData.data[key as string] = value;
      } else {
        realGlobal.reactiveData.data = {
          ...realGlobal.reactiveData.data,
          [key]: value,
        };
      }
    },
  };
}
