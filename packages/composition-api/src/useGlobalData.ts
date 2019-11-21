import checkSetupEnv from './checkSetupEnv';
import getAppStore from './getAppStore';

export default function useGlobalData<G extends Record<string, any>>() {
  checkSetupEnv('useGlobalData', ['app', 'page', 'component']);

  const app = getAppStore();

  return {
    get<T extends keyof G>(key: T) {
      return (app as any).$$compositionState[key] as G[T];
    },
    set<T extends keyof G>(key: T, value: G[T]) {
      (app as any).$$compositionState[key] = value;
    },
  };
}
