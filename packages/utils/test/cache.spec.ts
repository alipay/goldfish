import cache from '../src/cache';
import silent from '../src/silent';

it('should cache the function result.', async () => {
  const mockFn = jest.fn();
  const cacheFn = cache(() => {
    mockFn();
    return new Promise(resolve => {
      setTimeout(() => resolve('ret'), 100);
    });
  });
  expect(await cacheFn()).toEqual('ret');
  expect(await cacheFn()).toEqual('ret');
  expect(await Promise.all([cacheFn(), cacheFn()])).toEqual(['ret', 'ret']);
  expect(mockFn.mock.calls.length).toBe(1);
});

it('should rerun when error.', async () => {
  const mockFn = jest.fn();
  const cacheFn = cache(
    () => {
      mockFn();
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error()), 100);
      });
    },
    {
      shouldRerunWhenError: true,
    },
  );
  await Promise.all([silent.async(cacheFn)(), silent.async(cacheFn)()]);
  expect(mockFn.mock.calls.length).toBe(2);
});

it('should not rerun when error.', async () => {
  const mockFn = jest.fn();
  const cacheFn = cache(
    () => {
      mockFn();
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error()), 100);
      });
    },
    {
      shouldRerunWhenError: false,
    },
  );
  await Promise.all([silent.async(cacheFn)(), silent.async(cacheFn)()]);
  expect(mockFn.mock.calls.length).toBe(1);
});

it('should rerun when timeout.', async () => {
  const mockFn = jest.fn();
  const cacheFn = cache(mockFn, {
    time: 200,
  });

  await Promise.all([cacheFn(), cacheFn()]);
  expect(mockFn.mock.calls.length).toBe(1);
  await new Promise(resolve => setTimeout(resolve, 200));
  await Promise.all([cacheFn(), cacheFn()]);
  expect(mockFn.mock.calls.length).toBe(2);
});
