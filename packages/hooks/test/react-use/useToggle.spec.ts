import useToggle from 'react-use/esm/useToggle';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

const setUp = (initialValue: boolean) => renderHook(() => useToggle(initialValue));

it('should init state to true', () => {
  const { result } = setUp(true);

  expect(result.current[0]).toBe(true);
  expect(typeof result.current[1]).toBe('function');
});

it('should init state to false', () => {
  const { result } = setUp(false);

  expect(result.current[0]).toBe(false);
  expect(result.current[1]).toBeInstanceOf(Function);
});

it('should set state to true', async () => {
  const { result } = setUp(false);
  const [, toggle] = result.current;

  expect(result.current[0]).toBe(false);

  act(() => {
    toggle(true);
  });
  await timeout();
  expect(result.current[0]).toBe(true);
});

it('should set state to false', async () => {
  const { result } = setUp(true);
  const [, toggle] = result.current;

  expect(result.current[0]).toBe(true);

  act(() => {
    toggle(false);
  });
  await timeout();
  expect(result.current[0]).toBe(false);
});

it('should toggle state from true', async () => {
  const { result } = setUp(true);
  const [, toggle] = result.current;

  act(() => {
    toggle();
  });
  await timeout();
  expect(result.current[0]).toBe(false);
});

it('should toggle state from false', async () => {
  const { result } = setUp(false);
  const [, toggle] = result.current;

  act(() => {
    toggle();
  });
  await timeout();
  expect(result.current[0]).toBe(true);
});

it('should ignore non-boolean parameters and toggle state', async () => {
  const { result } = setUp(true);
  const [, toggle] = result.current;

  act(() => {
    toggle('string');
  });
  await timeout();
  expect(result.current[0]).toBe(false);

  act(() => {
    toggle({});
  });
  await timeout();
  expect(result.current[0]).toBe(true);
});
