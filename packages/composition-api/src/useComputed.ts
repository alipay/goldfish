import checkSetupEnv from './checkSetupEnv';
import reactive from './reactive';

export default function useComputed<T extends Record<string, any>>(val: T): T {
  checkSetupEnv('useComputed', ['app', 'page', 'component']);
  return reactive(val);
}
