import useLatest from 'react-use/esm/useLatest';
import renderHook from './renderHook';
import timeout from './timeout';

const setUp = () => {
  return renderHook(props => useLatest(props?.state), { initialProps: { state: 0 } });
};

it('should return a ref with the latest value on initial render', () => {
  const { result } = setUp();

  expect(result.current).toEqual({ current: 0 });
});

it('should always return a ref with the latest value after each update', async () => {
  const { result, rerender } = setUp();

  rerender({ state: 2 });
  await timeout();
  expect(result.current).toEqual({ current: 2 });

  rerender({ state: 4 });
  await timeout();
  expect(result.current).toEqual({ current: 4 });

  rerender({ state: 6 });
  await timeout();
  expect(result.current).toEqual({ current: 6 });
});
