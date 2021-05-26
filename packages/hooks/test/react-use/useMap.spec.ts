import useMap from 'react-use/esm/useMap';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

const setUp = <T extends object>(initialMap?: T) => renderHook(() => useMap(initialMap));

it('should init map and utils', () => {
  const { result } = setUp({ foo: 'bar', a: 1 });
  const [map, utils] = result.current;

  expect(map).toEqual({ foo: 'bar', a: 1 });
  expect(utils).toStrictEqual({
    get: expect.any(Function),
    set: expect.any(Function),
    setAll: expect.any(Function),
    remove: expect.any(Function),
    reset: expect.any(Function),
  });
});

it('should init empty map if not initial object provided', () => {
  const { result } = setUp();

  expect(result.current[0]).toEqual({});
});

it('should get corresponding value for initial provided key', () => {
  const { result } = setUp({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  let value;
  act(() => {
    value = utils.get('a');
  });

  expect(value).toBe(1);
});

it('should get corresponding value for existing provided key', async () => {
  const { result } = setUp({ foo: 'bar', a: 1 });

  act(() => {
    result.current[1].set('a', 99);
  });
  await timeout();

  let value;
  act(() => {
    value = result.current[1].get('a');
  });

  await timeout();
  expect(value).toBe(99);
});

it('should get undefined for non-existing provided key', () => {
  const { result } = setUp<{ foo: string; a: number; nonExisting?: any }>({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  let value;
  act(() => {
    value = utils.get('nonExisting');
  });

  expect(value).toBeUndefined();
});

it('should set new key-value pair', async () => {
  const { result } = setUp<{ foo: string; a: number; newKey?: number }>({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  act(() => {
    utils.set('newKey', 99);
  });
  await timeout();
  expect(result.current[0]).toEqual({ foo: 'bar', a: 1, newKey: 99 });
});

it('should override current value if setting existing key', async () => {
  const { result } = setUp({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  act(() => {
    utils.set('foo', 'qux');
  });
  await timeout();
  expect(result.current[0]).toEqual({ foo: 'qux', a: 1 });
});

it('should set new map', async () => {
  const { result } = setUp<{ foo: string; a: number; newKey?: number }>({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  act(() => {
    utils.setAll({ foo: 'foo', a: 2 });
  });
  await timeout();
  expect(result.current[0]).toEqual({ foo: 'foo', a: 2 });
});

it('should remove corresponding key-value pair for existing provided key', async () => {
  const { result } = setUp({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  act(() => {
    utils.remove('foo');
  });
  await timeout();
  expect(result.current[0]).toEqual({ a: 1 });
});

it('should do nothing if removing non-existing provided key', () => {
  const { result } = setUp<{ foo: string; a: number; nonExisting?: any }>({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  act(() => {
    utils.remove('nonExisting');
  });

  expect(result.current[0]).toEqual({ foo: 'bar', a: 1 });
});

it('should reset map to initial object provided', async () => {
  const { result } = setUp<{ foo: string; a: number; z?: number }>({ foo: 'bar', a: 1 });
  const [, utils] = result.current;

  act(() => {
    utils.set('z', 99);
  });
  await timeout();
  expect(result.current[0]).toEqual({ foo: 'bar', a: 1, z: 99 });

  act(() => {
    utils.reset();
  });
  await timeout();
  expect(result.current[0]).toEqual({ foo: 'bar', a: 1 });
});

it('should memoize actions with side effects', () => {
  const { result } = setUp({ foo: 'bar', a: 1 });
  const [, utils] = result.current;
  const { set, remove, reset } = utils;

  act(() => {
    set('foo', 'baz');
  });

  expect(result.current[1].set).toBe(set);
  expect(result.current[1].remove).toBe(remove);
  expect(result.current[1].reset).toBe(reset);
});
