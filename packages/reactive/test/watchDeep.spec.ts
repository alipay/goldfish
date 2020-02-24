import watchDeep from '../src/watchDeep';
import observable, { isObservable } from '../src/observable';
import { cloneDeep } from '@goldfishjs/utils';

it('should watch array push.', () => {
  const obj = {
    arr: ['a'],
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(
    obj,
    (...args) => {
      result.push(args[4]?.args);
    },
  );
  expect(result).toEqual([]);
  obj.arr.push('b');
  obj.arr.push('c');
  obj.arr.push('d');
  expect(result).toEqual([['b'], ['c'], ['d']]);
  stop();
});

it('should watch array push after reset the array.', () => {
  const obj = {
    arr: ['a'],
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(
    obj,
    (...args) => {
      result.push(args[4]?.args);
    },
  );
  expect(result).toEqual([]);
  const arr: any[] = [];
  obj.arr = arr;
  arr.push('b');
  arr.push('c');
  arr.push('d');
  expect(result).toEqual([undefined, ['b'], ['c'], ['d']]);
  stop();
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
  const stop1 = watchDeep(
    obj1,
    (...args) => {
      result1.push(args[4]?.args);
    },
  );

  const result2: any[] = [];
  const stop2 = watchDeep(
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

  expect(result1).toEqual([['b'], ['c'], ['d']]);
  expect(result2).toEqual([['b'], ['c'], ['d']]);
  stop1();
  stop2();
});

it('should handle nested array.', () => {
  const state: any = {
    taxList: [],
  };
  observable(state);

  const result: any[] = [];
  const stop = watchDeep(
    state,
    (obj, keyPathList, newV, oldV, options) => {
      result.push(cloneDeep(options));
    },
  );
  expect(result).toEqual([]);
  state.taxList = [];
  state.taxList.push({
    year: '2020',
    items: [],
  });
  state.taxList[0].items.push({ name: 'a' });
  state.taxList[0].items[0].name = 'c';

  expect(result[0]).toMatchObject({ type: 'normal' });
  expect(result[1]).toMatchObject({
    type: 'notify',
    args: [{
      year: '2020',
      items: [],
    }],
  });
  expect(result[2]).toMatchObject({
    type: 'notify',
    args: [{ name: 'a' }],
  });
  expect(result[3]).toMatchObject({
    type: 'normal',
  });
  stop();
});

// it('should handle recursion.', () => {
//   const obj = {
//     arr: ['a'],
//   };
//   observable(obj);

//   expect(
//     () => {
//       watchDeep(
//         obj,
//         () => {
//           obj.arr.push('c');
//         },
//       );
//       obj.arr.push('b');
//     },
//   ).toThrowError();
// });

it('should not watch the data after stopping.', () => {
  const obj = {
    arr: ['a'],
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(
    obj,
    (...args) => {
      result.push(args[4]?.args);
    },
  );
  expect(result).toEqual([]);
  obj.arr.push('b');
  stop();
  obj.arr.push('c');
  expect(result).toEqual([['b']]);
});

it('should not be triggered after changing the target data.', () => {
  const arr = ['a'];
  const obj = {
    arr,
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(
    obj,
    (...args) => {
      result.push(args[4]?.args);
    },
  );
  expect(result).toEqual([]);
  arr.push('b');
  obj.arr = [];
  arr.push('c');
  expect(result).toEqual([['b'], undefined]);
  stop();
});
