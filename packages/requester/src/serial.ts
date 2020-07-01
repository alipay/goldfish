import { silent } from '@goldfishjs/utils';

export interface ISerialFunction<R> {
  (): Promise<R> | R;
}

export interface ISerialOptions {
  dropNextWhenExecuting?: boolean;
}

export default function serial<R>(fn: ISerialFunction<R>, options?: ISerialOptions): ISerialFunction<R> {
  const promiseList: (Promise<R> | R)[] = [];
  return async () => {
    if (options?.dropNextWhenExecuting && promiseList.length) {
      return Promise.reject(new Error('The previous request is not completed.'));
    }

    await silent.async(() => Promise.all(promiseList.slice(0)))();
    promiseList.splice(0, promiseList.length);

    const promise = (() => {
      try {
        return fn();
      } catch (e) {
        throw e;
      }
    })();
    promiseList.push(promise);
    return promise;
  };
}
