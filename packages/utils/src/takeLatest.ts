import { PromiseCreator } from './types';

/**
 * Discard the previous return values, only keep the last return values
 */
function takeLatest<FuncType extends PromiseCreator>(
  promiseCreator: FuncType,
): FuncType {
  let index = 0;
  return ((...args) => {
    index += 1;
    const promise = promiseCreator(...args);

    function latest(
      func: (value?: any | PromiseLike<any>) => void,
      reqIndex: number,
    ) {
      return (...innerArgs: Array<any>): void => {
        if (reqIndex === index) {
          func(...innerArgs);
        }
      };
    }

    return new Promise((resolve, reject) => {
      promise.then(latest(resolve, index), latest(reject, index));
    });
  }) as FuncType;
}

export default takeLatest;
