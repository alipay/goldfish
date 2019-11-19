import { observable as reactiveObservable } from '@goldfishjs/reactive';
import checkSetupEnv from './checkSetupEnv';

const stateFlag = {};

export function isState(val: any) {
  return val && typeof val === 'object' && val.__type__ === stateFlag;
}

export default function useState<T extends Record<string, any>>(val: T): T {
  checkSetupEnv('useState', ['app', 'localPage', 'component', 'page']);

  const obj = val;
  Object.defineProperty(obj, '__type__', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: stateFlag,
  });
  return reactiveObservable(obj);
}
