import STATE_KEY from './STATE_KEY';

const ORIGIN_STATE_FLAG = {};

export function isOrigin(value: any) {
  return value === ORIGIN_STATE_FLAG;
}

export default function state(target: any, key: string): void;
// 返回值写成这样主要为了使用时候的类型推断
export default function state<T>(value: T): T;
export default function state(target: any, key?: string) {
  if (!key) {
    return {
      [STATE_KEY]: 'reactive',
      value: target,
    };
  }
  target[STATE_KEY] = { ...target[STATE_KEY] };
  target[STATE_KEY][key] = ORIGIN_STATE_FLAG;
}
