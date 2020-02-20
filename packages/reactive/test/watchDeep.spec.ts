import watchDeep from '../src/watchDeep';
import observable, { isObservable } from '../src/observable';

it('should watch array push.', () => {
  const obj = {
    arr: ['a'],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(
    obj,
    (...args) => {
      result.push(args[4]?.args);
    },
  );
  expect(result).toEqual([]);
  obj.arr.push('b');
  obj.arr.push('c');
  obj.arr.push('d');
  return Promise.resolve().then(() => {
    expect(result).toEqual([['b'], ['c'], ['d']]);
  });
});

it('should watch array push after reset the array.', () => {
  const obj = {
    arr: ['a'],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(
    obj,
    (...args) => {
      result.push(args[4]?.args);
    },
  );
  expect(result).toEqual([]);
  obj.arr = [];
  obj.arr.push('b');
  obj.arr.push('c');
  obj.arr.push('d');
  return Promise.resolve().then(() => {
    expect(result).toEqual([undefined, ['b'], ['c'], ['d']]);
  });
});

it('should watch array push in two observable objects.', () => {
  const arr = ['a'];

  const obj1 = {
    arr,
  };
  observable(obj1);

  const obj2 = {
    arr,
  };
  observable(obj2);

  const result1: any[] = [];
  watchDeep(
    obj1,
    (...args) => {
      result1.push(args[4]?.args);
    },
  );

  const result2: any[] = [];
  watchDeep(
    obj2,
    (...args) => {
      result2.push(args[4]?.args);
    },
  );

  expect(isObservable(arr)).toBe(true);
  expect(result1).toEqual([]);
  expect(result2).toEqual([]);
  arr.push('b');
  arr.push('c');
  arr.push('d');
  return Promise.resolve().then(() => {
    expect(result2).toEqual([['b'], ['c'], ['d']]);
    expect(result1).toEqual([['b'], ['c'], ['d']]);
  });
});
