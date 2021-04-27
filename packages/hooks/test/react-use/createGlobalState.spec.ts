import createGlobalState from 'react-use/esm/factory/createGlobalState';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

describe('useGlobalState', () => {
  it('should be defined', () => {
    expect(createGlobalState).toBeDefined();
  });

  it('both components should be updated', async () => {
    const useGlobalValue = createGlobalState(0);
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0]).toBe(0);
    expect(result2.current[0]).toBe(0);
    act(() => {
      result1.current[1](1);
    });
    await timeout();
    expect(result1.current[0]).toBe(1);
    expect(result2.current[0]).toBe(1);
  });

  it('allows setting state with function and previous value', async () => {
    const useGlobalValue = createGlobalState(0);
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0]).toBe(0);
    expect(result2.current[0]).toBe(0);
    act(() => {
      result1.current[1]((value: any) => value + 1);
    });
    await timeout();
    expect(result1.current[0]).toBe(1);
    expect(result2.current[0]).toBe(1);
  });

  it('allows setting state with function and no previous value', async () => {
    const useGlobalValue = createGlobalState(0);
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0]).toBe(0);
    expect(result2.current[0]).toBe(0);
    act(() => {
      result1.current[1](() => 1);
    });
    await timeout();
    expect(result1.current[0]).toBe(1);
    expect(result2.current[0]).toBe(1);
  });

  it('initializes and updates with undefined', () => {
    const useGlobalValue = createGlobalState<number>();
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0]).toBe(undefined);
    expect(result2.current[0]).toBe(undefined);
    act(() => {
      // this is the only case where types fail, it should guard the number
      result1.current[1]((value: any) => value);
    });
    expect(result1.current[0]).toBe(undefined);
    expect(result2.current[0]).toBe(undefined);
  });

  it('initializes with undefined and updates with different type', () => {
    const useGlobalValue = createGlobalState();
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0]).toBe(undefined);
    expect(result2.current[0]).toBe(undefined);
    act(() => {
      result1.current[1](() => 1);
    });
  });

  it('initializes with function', async () => {
    const useGlobalValue = createGlobalState(() => 0);
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0]).toBe(0);
    expect(result2.current[0]).toBe(0);
    act(() => {
      result1.current[1](1);
    });
    await timeout();
    expect(result1.current[0]).toBe(1);
    expect(result2.current[0]).toBe(1);
  });
});
