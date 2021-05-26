import useMethods from 'react-use/esm/useMethods';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

it('should have initialState value as the returned state value', () => {
  const initialState = {
    count: 10,
  };

  const createMethods = (state: any) => ({
    doStuff: () => state,
  });

  const { result } = renderHook(() => useMethods(createMethods, initialState));

  expect(result.current[0]).toEqual(initialState);
});

it('should return wrappedMethods object containing all the methods defined in createMethods', () => {
  const initialState = {
    count: 10,
  };

  const createMethods = (state: any) => ({
    reset() {
      return initialState;
    },
    increment() {
      return { ...state, count: state.count + 1 };
    },
    decrement() {
      return { ...state, count: state.count - 1 };
    },
  });

  const { result } = renderHook(() => useMethods(createMethods, initialState));

  for (const key of Object.keys(createMethods(initialState))) {
    expect(result.current[1][key]).toBeDefined();
  }
});

it('should properly update the state based on the createMethods', async () => {
  const count = 10;
  const initialState = {
    count,
  };

  const createMethods = (state: any) => ({
    reset() {
      return initialState;
    },
    increment() {
      return { ...state, count: state.count + 1 };
    },
    decrement() {
      return { ...state, count: state.count - 1 };
    },
  });

  const { result } = renderHook(() => useMethods(createMethods, initialState));

  act(() => {
    result.current[1].increment();
  });
  await timeout();
  expect(result.current[0].count).toBe(count + 1);

  act(() => {
    result.current[1].decrement();
  });
  await timeout();
  expect(result.current[0].count).toBe(count);

  act(() => {
    result.current[1].decrement();
  });
  await timeout();
  expect(result.current[0].count).toBe(count - 1);

  act(() => {
    result.current[1].reset();
  });
  await timeout();
  expect(result.current[0].count).toBe(count);
});
