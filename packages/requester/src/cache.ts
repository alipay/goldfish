import { cache as utilsCache, commonError } from '@goldfishjs/utils';
import { ICommonError } from '@goldfishjs/utils/types/commonError';

export interface ICacheOptions {
  /**
   * If the current execution receive an error response,
   * whether the next execution should rerun or use the error result.
   */
  shouldRerunWhenError?: boolean;
  /**
   * Cache time. Set it to -1 if you want permanent in memory cache.
   */
  time?: number;
}

export interface ICacheFunction<R> {
  (): Promise<R> | R;
}

/**
 * Wrap the async function with cache.
 *
 * @param fn
 * @param options
 */
export default async function cache<R>(fn: ICacheFunction<R>, options?: ICacheOptions) {
  const resultFn = utilsCache(fn as any, options);

  let hasError = false;
  let realFn: ICacheFunction<R> = resultFn;
  const retFn = async (): Promise<[any, ICommonError | undefined]> => {
    const [result, error] = await commonError(realFn);

    // The first error response;
    if (!hasError && error) {
      hasError = true;
      return [result, error];
    }

    if (hasError && error && options?.shouldRerunWhenError) {
      realFn = resultFn.forceRefresh;
      return retFn();
    }

    if (!error) {
      realFn = resultFn;
      hasError = false;
    }

    return [result, error];
  };

  return retFn;
}
