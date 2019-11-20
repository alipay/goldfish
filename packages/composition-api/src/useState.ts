import { observable as reactiveObservable } from '@goldfishjs/reactive';
import checkSetupEnv from './checkSetupEnv';
import useComputed from './useComputed';

export default function useState<T extends Record<string, any>>(val: T): T {
  checkSetupEnv('useState', ['app', 'component', 'page']);
  return reactiveObservable(useComputed(val));
}
