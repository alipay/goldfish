export default function attachLogic<K extends string, F extends (...args: any[]) => any>(
  options: { [N in K]?: F },
  key: K,
  position: 'before' | 'after',
  fn: F,
) {
  const oldFn = options[key];
  options[key] = function (this: any, ...args: any[]): any {
    if (position === 'before') {
      fn.call(this, ...args);
    }
    const result = oldFn && oldFn.call(this, ...args);
    if (position === 'after') {
      fn.call(this, ...args);
    }
    return result;
  } as any;
}
