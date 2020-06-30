import { FunctionType, PromiseCreator } from './types';

/* eslint-disable no-console */
/**
 * async silent failure, do not affect other code execution
 *
 * return null if error
 */

type ReturnWithNull<FnType extends FunctionType> = (...args: Parameters<FnType>) => ReturnType<FnType> | null;

type ResolveWithNull<FnType extends PromiseCreator> = (
  ...args: Parameters<FnType>
) => ReturnType<FnType> | Promise<null>;

function silent<FnType extends FunctionType>(fn: FnType): ReturnWithNull<FnType> {
  return (...args: Parameters<ReturnWithNull<FnType>>): ReturnType<ReturnWithNull<FnType>> => {
    try {
      return fn(...args);
    } catch (e) {
      if (typeof console !== 'undefined' && console.error) {
        console.error(e);
      }
      return null;
    }
  };
}

silent.async = <FnType extends PromiseCreator>(fn: FnType): ResolveWithNull<FnType> =>
  (async (...args: Parameters<ResolveWithNull<FnType>>): Promise<any> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (typeof console !== 'undefined' && console.error) {
        console.error(e);
      }
      return null;
    }
  }) as ResolveWithNull<FnType>;

export default silent;
