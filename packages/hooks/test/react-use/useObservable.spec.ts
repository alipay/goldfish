import { Subject } from 'rxjs';
import * as useIsomorphicLayoutEffectWithDefault from 'react-use/esm/useIsomorphicLayoutEffect';
import useObservable, { Observable } from 'react-use/esm/useObservable';
import renderHook from './renderHook';
import act from './act';
import timeout from './timeout';

const setUp = (observable: Observable<any>, initialValue?: any) =>
  renderHook(() => useObservable(observable, initialValue));

it('should init to initial value provided', () => {
  const subject$ = new Subject();
  const { result } = setUp(subject$, 123);

  expect(result.current).toBe(123);
});

it('should init to undefined if not initial value provided', () => {
  const subject$ = new Subject();
  const { result } = setUp(subject$);

  expect(result.current).toBeUndefined();
});

it('should return latest value of observables', async () => {
  const subject$ = new Subject();
  const { result } = setUp(subject$, 123);

  act(() => {
    subject$.next(125);
  });
  await timeout();
  expect(result.current).toBe(125);

  act(() => {
    subject$.next(300);
    subject$.next(400);
  });
  await timeout();
  expect(result.current).toBe(400);
});

it('should use layout effect to subscribe synchronously', async () => {
  const subject$ = new Subject();
  const spy = jest.spyOn(useIsomorphicLayoutEffectWithDefault, 'default');

  expect(spy).toHaveBeenCalledTimes(0);

  setUp(subject$, 123);

  await timeout();
  expect(spy).toHaveBeenCalledTimes(1);
});

it('should subscribe to observable only once', () => {
  const subject$ = new Subject();
  const spy = jest.spyOn(subject$, 'subscribe');
  expect(spy).not.toHaveBeenCalled();

  setUp(subject$, 123);

  expect(spy).toHaveBeenCalledTimes(1);

  act(() => {
    subject$.next('a');
  });

  act(() => {
    subject$.next('b');
  });

  expect(spy).toHaveBeenCalledTimes(1);
});

it('should return updated value when observable changes', async () => {
  const subject$ = new Subject();
  const { result } = setUp(subject$);
  expect(result.current).toBeUndefined();

  act(() => {
    subject$.next('foo');
  });
  await timeout();
  expect(result.current).toBe('foo');

  act(() => {
    subject$.next('bar');
  });
  await timeout();
  expect(result.current).toBe('bar');
});

it('should unsubscribe from observable', () => {
  const subject$ = new Subject();
  const unsubscribeMock = jest.fn();
  subject$.subscribe = jest.fn().mockReturnValue({
    unsubscribe: unsubscribeMock,
  });

  const { unmount } = setUp(subject$);
  expect(unsubscribeMock).not.toHaveBeenCalled();

  act(() => {
    subject$.next('foo');
  });
  expect(unsubscribeMock).not.toHaveBeenCalled();

  act(() => {
    subject$.next('bar');
  });
  expect(unsubscribeMock).not.toHaveBeenCalled();

  unmount();
  expect(unsubscribeMock).toHaveBeenCalledTimes(1);
});
