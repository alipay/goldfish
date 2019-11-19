import { observable as reactiveObservable } from '@goldfishjs/goldfish-reactive';
import checkSetupEnv from './checkSetupEnv';

const valueFlag = {};

export function isValue(val: any) {
  return val && typeof val === 'object' && val.__type__ === valueFlag;
}

type PrimaryType = number | boolean | null | undefined | string;

export default function useValue<T extends PrimaryType>(val: T): { value: T } {
  checkSetupEnv('useState', ['app', 'localPage', 'component', 'page']);

  const obj: Record<string, any> = { value: val };
  Object.defineProperty(obj, '__type__', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: valueFlag,
  });
  return reactiveObservable(obj) as { value: T };
}
