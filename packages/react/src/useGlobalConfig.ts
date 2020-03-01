import { default as Global, global } from './Global';

export default function useGlobalConfig<C extends Record<string, any>>(passInGlobal?: Global) {
  const realGlobal = passInGlobal || global;
  return {
    get: <T extends keyof C>(key: T) => {
      return realGlobal.config[key as string];
    },
  };
}
