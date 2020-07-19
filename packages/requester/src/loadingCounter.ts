import { observable } from '@goldfishjs/reactive';

export interface ILoadingCounterFunction<R> {
  (): Promise<R> | R;
}

export interface ILoadingCounterOptions {
  /**
   * The delay time in `ms` to start counting.
   */
  delay?: number;
}

/**
 * Provide the loading counter for requesting.
 *
 * @param fn
 * @param options
 */
export default function loadingCounter<R>(
  fn: ILoadingCounterFunction<R>,
  options?: ILoadingCounterOptions,
): [ILoadingCounterFunction<R>, { value: number }] {
  const delay = options?.delay !== undefined ? options.delay : 300;
  const counter = observable({ value: 0 });
  const counterFn = () => {
    let isIncreased = false;
    let timer: ReturnType<typeof setTimeout>;
    if (delay <= 0) {
      counter.value += 1;
      isIncreased = true;
    } else {
      timer = setTimeout(() => {
        counter.value += 1;
        isIncreased = true;
      }, delay);
    }

    return () => {
      if (isIncreased) {
        counter.value -= 1;
      } else if (timer) {
        clearTimeout(timer);
      }
    };
  };

  const wrappedFn = async () => {
    const cancel = counterFn();

    try {
      const result = await fn();
      return result;
    } catch (e) {
      throw e;
    } finally {
      cancel();
    }
  };

  return [wrappedFn, counter];
}
