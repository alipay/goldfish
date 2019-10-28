import COMPUTED_KEY from './COMPUTED_KEY';

// 返回值写成这样主要为了使用时候的类型推断
export default function computed<T>(value: T): T;
export default function computed(
  target: any,
  key: string,
  descriptor: TypedPropertyDescriptor<any>,
): void;
export default function computed(
  target: any,
  key?: string,
  descriptor?: TypedPropertyDescriptor<any>,
) {
  if (!key) {
    return {
      [COMPUTED_KEY]: 'reactive',
      value: target,
    };
  }

  target[COMPUTED_KEY] = { ...target[COMPUTED_KEY] };
  target[COMPUTED_KEY][key] = descriptor;
}
