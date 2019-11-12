const stack: any[] = [];

export function getCurrent<T>(): T {
  if (!stack.length) {
    throw new Error('Do not get current out of wrap function.');
  }

  return stack[stack.length - 1];
}

export function wrap<R>(globalCache: any, fn: () => R): R {
  stack.push(globalCache);
  try {
    return fn();
  } catch (e) {
    throw e;
  } finally {
    stack.pop();
  }
}
