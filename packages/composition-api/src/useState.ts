import checkSetupEnv from './checkSetupEnv';
import reactive from './reactive';

export default function useState<T extends Record<string, any>>(val: T): T {
  checkSetupEnv('useState', ['app', 'component', 'page']);
  return reactive(val);
}
