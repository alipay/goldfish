import { default as App, app } from './App';

export default function useGlobalStorage<G extends Record<string, any>>(passInApp?: App) {
  const realGlobal = passInApp || app;
  return {
    get<T extends keyof G>(key: T): G[T] | undefined {
      return realGlobal.normalData.data[key];
    },
    set<T extends keyof G>(key: T, value: G[T]) {
      realGlobal.normalData.data[key] = value;
    },
  };
}
