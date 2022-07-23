import { default as observable, isObservable, IObservableObject, ObservableArray, set } from '../src/observable';
import watch from '../src/watch';

it('should convert a normal object to be observable.', () => {
  const obj: any = {
    a: 1,
    b: 2,
  };
  observable(obj);
  expect(isObservable(obj)).toBe(true);
});

it('should convert a normal object with an array to be observable.', () => {
  const obj = {
    a: 1,
    b: [1, 2],
  };
  observable(obj);
  expect(isObservable(obj.b)).toBe(true);
});

it('should convert the new object property to be observable.', () => {
  const obj: Record<string, any> = {
    a: 1,
    b: 2,
  };
  observable(obj);
  obj.b = {
    c: 3,
  };
  expect(isObservable(obj.b)).toBe(true);
});

it('should convert the new array property to be observable.', () => {
  const obj: Record<string, any> = {
    a: 1,
    b: 2,
  };
  observable(obj);
  obj.b = [2, 3];
  expect(isObservable(obj.b)).toBe(true);
});

it('should convert the new Array element to be observable.', () => {
  const arr: ObservableArray = [1, 2, 3];
  const obj: IObservableObject = { arr };
  observable(obj);

  const newObj = {
    a: 1,
  };
  arr.push(newObj);
  expect(isObservable(newObj)).toBe(true);
});

it('should change the new Array object to observable.', () => {
  const obj: Record<string, any> = {
    a: [1, 2, 3, 4, 5],
  };
  observable(obj);

  obj.a.splice(0, 2, 6, { name: 'zhangsan' });
  expect(isObservable(obj.a[1])).toBe(true);
});

it('should notify change when the array is changed by sort.', async () => {
  const obj: Record<string, any> = {
    a: [1, 2],
  };
  observable(obj);
  let counter = 0;
  const stop = watch(
    () => obj.a,
    () => {
      counter += 1;
    },
  );

  obj.a.sort((a: number, b: number) => b - a);
  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should notify change when the array is changed by shift.', async () => {
  const obj: Record<string, any> = {
    a: [1, 2],
  };
  observable(obj);
  let counter = 0;
  const stop = watch(
    () => obj.a,
    () => {
      counter += 1;
    },
  );

  obj.a.shift((a: number, b: number) => b - a);
  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should notify change when the array is changed by unshift.', async () => {
  const obj: Record<string, any> = {
    a: [1, 2],
  };
  observable(obj);
  let counter = 0;
  const stop = watch(
    () => obj.a,
    () => {
      counter += 1;
    },
  );

  obj.a.unshift((a: number, b: number) => b - a);
  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should notify change when the array is changed by reverse.', async () => {
  const obj: Record<string, any> = {
    a: [1, 2],
  };
  observable(obj);
  let counter = 0;
  const stop = watch(
    () => obj.a,
    () => {
      counter += 1;
    },
  );

  obj.a.reverse((a: number, b: number) => b - a);
  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should notify change when the array is changed by splice.', async () => {
  const obj: Record<string, any> = {
    a: [1, 2],
  };
  observable(obj);
  let counter = 0;
  const stop = watch(
    () => obj.a,
    () => {
      counter += 1;
    },
  );

  obj.a.splice(0, 1, 3);
  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should change the new property to reactive one.', async () => {
  const obj: Record<string, any> = {};
  observable(obj);

  set(obj, 'name', '');

  let counter = 0;
  const stop = watch(
    () => obj.name,
    () => {
      counter += 1;
    },
  );

  obj.name = 'yibuyisheng';

  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should react to the array change.', async () => {
  const obj: Record<string, any> = {
    arr: [],
  };
  observable(obj);

  let counter = 0;
  const stop = watch(
    () => obj.arr,
    () => {
      counter += 1;
    },
  );

  obj.arr.push(1);

  await Promise.resolve();
  expect(counter).toBe(1);
  stop();
});

it('should react to the new property', async () => {
  const obj: Record<string, any> = {
    item: {},
  };
  observable(obj);

  let counter = 0;
  const stop = watch(
    () => obj,
    () => {
      counter += 1;
    },
    {
      deep: true,
    },
  );

  set(obj.item, 'name', 'diandao');
  set(obj, 'name', 'diandao');

  await Promise.resolve();
  expect(counter).toBe(1);

  obj.name = 'diandao2';
  await Promise.resolve();
  expect(counter).toBe(2);

  stop();
});

// it('should convert the bigdata in the expected time.', () => {
//   const data = lodash.cloneDeep(bigdata);

//   const now = new Date().getTime();
//   observable(data as any);
//   watchDeep(data, () => {});
//   expect(Date.now() - now).toBeLessThan(500);
// });
