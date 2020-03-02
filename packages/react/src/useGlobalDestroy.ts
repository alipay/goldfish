import { default as App, app } from './App';

export default function useGlobalDestroy(fn: () => void, passInApp?: App) {
  const realGlobal = passInApp || app;
  realGlobal.destroyList.push(fn);
}
