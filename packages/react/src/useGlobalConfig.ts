import { default as App, app } from './App';

export default function useGlobalConfig<C extends Record<string, any>>(passInApp?: App) {
  const realGlobal = passInApp || app;
  return {
    get: <T extends keyof C>(key: T) => {
      return realGlobal.config[key as string];
    },
  };
}
