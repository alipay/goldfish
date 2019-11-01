import { PromiseCreator } from '../types';

function takeLatest<FuncType extends PromiseCreator>(
  promiseCreator: FuncType,
): FuncType {
  let index = 0;
  return ((...args) => {
    index += 1;
    const promise = promiseCreator(...args);

    function guardLatest(
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
      promise.then(guardLatest(resolve, index), guardLatest(reject, index));
    });
  }) as FuncType;
}

export default takeLatest;
