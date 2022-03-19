import usePrevious from 'react-use/esm/usePrevious';
import renderHook from './renderHook';
import timeout from './timeout';

const setUp = () =>
  renderHook(
    (props: any) => {
      return usePrevious(props?.state);
    },
    { initialProps: { state: 0 } },
  );

it('should return undefined on initial render', () => {
  const { result } = setUp();

  expect(result.current).toBeUndefined();
});

it('should always return previous state after each update', async () => {
  const { result, rerender } = setUp();

  rerender({ state: 2 });
  expect(result.current).toBe(0);

  rerender({ state: 4 });
  await timeout();
  expect(result.current).toBe(2);

  rerender({ state: 6 });
  await timeout();
  expect(result.current).toBe(4);
});
