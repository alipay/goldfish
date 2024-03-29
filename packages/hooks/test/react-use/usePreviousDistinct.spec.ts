import usePreviousDistinct, { Predicate } from 'react-use/esm/usePreviousDistinct';
import renderHook from './renderHook';
import timeout from './timeout';

describe('usePreviousDistinct', () => {
  it('should be defined', () => {
    expect(usePreviousDistinct).toBeDefined();
  });

  function getHook<T>(initialValue?: T, predicate?: Predicate<T>) {
    return renderHook(
      props => {
        return usePreviousDistinct<T>(props?.val as T, props?.cmp);
      },
      {
        initialProps: {
          val: initialValue || 0,
          cmp: predicate,
        } as { val?: T; cmp?: Predicate<T> },
      },
    );
  }

  it('should return undefined on init', () => {
    expect(getHook().result.current).toBeUndefined();
  });

  it('should not invoke predicate on first render', () => {
    const spy = jest.fn();
    getHook(0, spy);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should update previous value only after render with different value', async () => {
    const hook = getHook();

    expect(hook.result.current).toBeUndefined();

    hook.rerender({ val: 0 });
    expect(hook.result.current).toBeUndefined();

    hook.rerender({ val: 1 });
    await timeout();
    expect(hook.result.current).toBe(0);

    hook.rerender({ val: 2 });
    await timeout();
    expect(hook.result.current).toBe(1);

    hook.rerender({ val: 2 });
    await timeout();
    expect(hook.result.current).toBe(1);

    hook.rerender({ val: 3 });
    await timeout();
    expect(hook.result.current).toBe(2);
  });

  it('should work fine with `undefined` values', async () => {
    const hook = renderHook(props => usePreviousDistinct(props?.value), {
      initialProps: { value: undefined as undefined | number },
    });

    expect(hook.result.current).toBeUndefined();

    hook.rerender({ value: 1 });
    expect(hook.result.current).toBeUndefined();

    hook.rerender({ value: undefined });
    await timeout();
    expect(hook.result.current).toBe(1);

    hook.rerender({ value: 2 });
    await timeout();
    expect(hook.result.current).toBeUndefined();
  });

  it('should receive a predicate as a second parameter that will compare prev and current', async () => {
    const obj1 = { label: 'John', value: 'john' };
    const obj2 = { label: 'Jonny', value: 'john' };
    const obj3 = { label: 'Kate', value: 'kate' };
    const predicate = (a: any, b: any) => !!a && a.value === b.value;

    const hook = getHook(obj1 as { label: string; value: string }, predicate);

    expect(hook.result.current).toBeUndefined();

    hook.rerender({ val: obj2, cmp: predicate });

    expect(hook.result.current).toBeUndefined();

    hook.rerender({ val: obj3, cmp: predicate });
    await timeout();
    expect(hook.result.current).toEqual(obj1);
  });
});
