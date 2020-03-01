import { default as Global, global } from './Global';

export default function useGlobalStorage(passInGlobal?: Global) {
  const realGlobal = passInGlobal || global;
  return {
    get: (key: string) => {
      return realGlobal.normalData.data[key];
    },
    set: (key: string, value: any) => {
      realGlobal.normalData.data[key] = value;
    },
  };
}
