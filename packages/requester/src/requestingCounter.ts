import { observable } from '@goldfishjs/reactive';

export interface IRequestingCounterFunction<R> {
  (): Promise<R> | R;
}

/**
 * The requesting counter.
 *
 * @param fn
 */
export default function RequestingCounter<R>(
  fn: IRequestingCounterFunction<R>,
): [IRequestingCounterFunction<R>, { value: number }] {
  const counter = observable({ value: 0 });

  const wrappedFn = async () => {
    counter.value += 1;
    try {
      const result = await fn();
      return result;
    } catch (e) {
      throw e;
    } finally {
      counter.value -= 1;
    }
  };

  return [wrappedFn, counter];
}
