import { cloneDeep } from '@goldfishjs/utils';
import watchDeep from '../src/watchDeep';
import observable, { isObservable } from '../src/observable';

it('should watch array push.', () => {
  const obj = {
    arr: ['a'],
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(obj, (...args) => {
    result.push(args[4]?.args);
  });
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
  const stop = watchDeep(obj, (...args) => {
    result.push(args[4]?.args);
  });
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
  const stop1 = watchDeep(obj1, (...args) => {
    result1.push(args[4]?.args);
  });

  const result2: any[] = [];
  const stop2 = watchDeep(obj2, (...args) => {
    result2.push(args[4]?.args);
  });

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
  const stop = watchDeep(state, (obj, keyPathList, newV, oldV, options) => {
    result.push(cloneDeep(options));
  });
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
    args: [
      {
        year: '2020',
        items: [],
      },
    ],
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
  const stop = watchDeep(obj, (...args) => {
    result.push(args[4]?.args);
  });
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
  const stop = watchDeep(obj, (...args) => {
    result.push(args[4]?.args);
  });
  expect(result).toEqual([]);
  arr.push('b');
  obj.arr = [];
  arr.push('c');
  expect(result).toEqual([['b'], undefined]);
  stop();
});

it('should listen the new elements changing that pushed to the array.', () => {
  const obj = {
    data: [
      {
        name: 'zs',
      },
    ],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(obj, (...args) => {
    result.push(args);
  });

  obj.data.push({ name: 'ls' });
  expect(result[0][1]).toEqual(['data']);

  obj.data[1].name = 'ww';
  expect(result[1][1]).toEqual(['data', 1, 'name']);

  obj.data[1] = { name: 'll' };
  expect(result[2][1]).toEqual(['data', 1]);
});

it("should remove the old elements' listeners that pop from the array.", () => {
  const element1 = {
    name: 'zs',
  };
  const element2 = {
    name: 'ls',
  };
  const obj = {
    data: [element1, element2],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(obj, (...args) => {
    result.push(args);
  });

  element2.name = 'ww';
  expect(result[0][1]).toEqual(['data', 1, 'name']);

  obj.data.pop();
  expect(result[1][1]).toEqual(['data']);
  expect(result.length).toBe(2);

  element2.name = 'll';
  expect(result.length).toBe(2);
});

it("should remove the old elements' listeners that shift from the array.", () => {
  const element1 = {
    name: 'zs',
  };
  const element2 = {
    name: 'ls',
  };
  const obj = {
    data: [element1, element2],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(obj, (...args) => {
    result.push(args);
  });

  element1.name = 'ww';
  expect(result[0][1]).toEqual(['data', 0, 'name']);

  // https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.shift
  obj.data.shift();
  expect(result[1][1]).toEqual(['data', 0]);
  expect(result[2][1]).toEqual(['data']);

  element1.name = 'll';
  expect(result.length).toBe(3);
});

it('should listen the new elements changing that unshifted to the array.', () => {
  const element1 = { name: 'zs' };
  const element2 = { name: 'ls' };
  const obj = {
    data: [element1],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(obj, (...args) => {
    result.push(args);
  });

  // https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.unshift
  obj.data.unshift(element2);
  expect(result[0][1]).toEqual(['data', 0]);
  expect(result[1][1]).toEqual(['data']);

  element2.name = 'ww';
  expect(result[2][1]).toEqual(['data', 0, 'name']);
});

it('should handle the elements removing by `splice`.', () => {
  const element1 = { name: 'zs' };
  const element2 = { name: 'ls' };
  const element3 = { name: 'ww' };
  const element4 = { name: 'll' };
  const obj = {
    data: [element1, element2, element3, element4],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(obj, (...args) => {
    result.push(args);
  });

  obj.data.splice(1, 2);
  expect(result[0][1]).toEqual(['data', 1]);
  expect(result[1][1]).toEqual(['data']);
  expect(result.length).toBe(2);

  element2.name = 'xx';
  element3.name = 'yy';
  expect(result.length).toBe(2);

  element4.name = 'zz';
  expect(result[2][1]).toEqual(['data', 1, 'name']);
});

it('should swap the elements.', () => {
  const element1 = { name: 'zs' };
  const element2 = { name: 'ls' };
  const obj = {
    data: [element1, element2],
  };
  observable(obj);

  const result: any[] = [];
  watchDeep(obj, (...args) => {
    result.push(args);
  });

  const temp = obj.data[0];
  obj.data[0] = obj.data[1];
  obj.data[1] = temp;

  expect(result[0][1]).toEqual(['data', 0]);
  expect(result[1][1]).toEqual(['data', 1]);

  element1.name = 'xx';
  expect(result[2][1]).toEqual(['data', 1, 'name']);

  element2.name = 'yy';
  expect(result[3][1]).toEqual(['data', 0, 'name']);
});

it('should watch the object with special keys.', () => {
  const obj = {
    address: {
      city: 'a',
    },
    '.addr': {
      city: 'c',
    },
    'addr.': {
      city: 'd',
    },
    '[addr': {
      city: 'e',
    },
    'addr[]': {
      city: 'f',
    },
    'addr addr': {
      city: 'g',
    },
    addr: {
      city: 'b',
    },
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(obj, (...args) => {
    result.push(args[2]);
  });
  expect(result).toEqual([]);

  obj.address.city = 'a1';
  obj['addr'].city = 'b1';
  obj['.addr'].city = 'c1';
  obj['addr.'].city = 'd1';
  obj['[addr'].city = 'e1';
  obj['addr[]'].city = 'f1';
  obj['addr addr'].city = 'g1';
  expect(result).toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1']);

  stop();
});

it('should watch the object with `valueOf` property.', () => {
  const obj = {
    valueOf: 'a',
  };
  observable(obj);

  const result: any[] = [];
  const stop = watchDeep(obj, (...args) => {
    result.push(args[2]);
  });
  obj.valueOf = 'b';
  obj.valueOf = 'c';
  expect(result).toEqual(['b', 'c']);
  stop();
});
