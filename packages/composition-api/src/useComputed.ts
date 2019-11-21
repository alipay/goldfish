import checkSetupEnv from './checkSetupEnv';
import { reactive } from './useState';

export default function useComputed<T extends Record<string, any>>(val: T): T {
  checkSetupEnv('useComputed', ['app', 'page', 'component']);
  return reactive(val);
}
