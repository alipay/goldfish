import useSetState from 'react-use/esm/useSetState';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

const setUp = (initialState?: object) => renderHook(() => useSetState(initialState));

it('should init state and setter', () => {
  const { result } = setUp({ foo: 'bar' });
  const [state, setState] = result.current;

  expect(state).toEqual({ foo: 'bar' });
  expect(setState).toBeInstanceOf(Function);
});

it('should init empty state if not initial state provided', () => {
  const { result } = setUp();

  expect(result.current[0]).toEqual({});
});

it('should merge changes into current state when providing object', async () => {
  const { result } = setUp({ foo: 'bar', count: 1 });
  const [state, setState] = result.current;

  act(() => {
    setState({ count: state.count + 1, someBool: true });
  });

  await timeout();
  expect(result.current[0]).toEqual({ foo: 'bar', count: 2, someBool: true });
});

it('should merge changes into current state when providing function', async () => {
  const { result } = setUp({ foo: 'bar', count: 1 });
  const [, setState] = result.current;

  act(() => {
    setState((prevState: any) => ({ count: prevState.count + 1, someBool: true }));
  });

  await timeout();
  expect(result.current[0]).toEqual({ foo: 'bar', count: 2, someBool: true });
});

/**
 * Enforces cases where a hook can safely depend on the callback without
 * causing an endless rerender cycle: useEffect(() => setState({ data }), [setState]);
 */
it('should return a memoized setState callback', () => {
  const { result, rerender } = setUp({ ok: false });
  const [, setState1] = result.current;

  act(() => {
    setState1({ ok: true });
  });
  rerender();

  const [, setState2] = result.current;

  expect(setState1).toBe(setState2);
});
