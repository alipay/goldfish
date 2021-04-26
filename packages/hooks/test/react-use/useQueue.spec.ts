import useQueue from 'react-use/esm/useQueue';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

const setUp = (initialQueue?: any[]) => renderHook(() => useQueue(initialQueue));

it('takes initial state', () => {
  const { result } = setUp([1, 2, 3]);
  const { first, last, size } = result.current;
  expect(first).toEqual(1);
  expect(last).toEqual(3);
  expect(size).toEqual(3);
});

it('appends new member', async () => {
  const { result } = setUp([1, 2]);
  act(() => {
    result.current.add(3);
  });
  await timeout();
  const { first, last, size } = result.current;
  expect(first).toEqual(1);
  expect(last).toEqual(3);
  expect(size).toEqual(3);
});

it('pops oldest member', async () => {
  const { result } = setUp([1, 2]);
  act(() => {
    result.current.remove();
  });
  await timeout();
  const { first, size } = result.current;
  expect(first).toEqual(2);
  expect(size).toEqual(1);
});
