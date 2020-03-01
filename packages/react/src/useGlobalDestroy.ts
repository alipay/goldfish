import { default as Global, global } from './Global';

export default function useGlobalDestroy(fn: () => void, passInGlobal?: Global) {
  const realGlobal = passInGlobal || global;
  realGlobal.destroyList.push(fn);
}
