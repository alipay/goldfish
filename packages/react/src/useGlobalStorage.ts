import { default as App, app } from './App';

export default function useGlobalStorage(passInApp?: App) {
  const realGlobal = passInApp || app;
  return {
    get: (key: string) => {
      return realGlobal.normalData.data[key];
    },
    set: (key: string, value: any) => {
      realGlobal.normalData.data[key] = value;
    },
  };
}
