import { silent } from '@goldfishjs/utils';

export interface ISerialFunction<R> {
  (): Promise<R> | R;
}

export interface ISerialOptions {
  usePreviousResult?: boolean;
}

export default function serial<R>(fn: ISerialFunction<R>, options?: ISerialOptions): ISerialFunction<R> {
  const promiseList: (Promise<R> | R)[] = [];
  return async () => {
    if (options?.usePreviousResult && promiseList.length) {
      return promiseList[promiseList.length - 1];
    }

    await silent.async(() => Promise.all(promiseList))();

    const promise = (() => {
      try {
        return Promise.resolve(fn());
      } catch (e) {
        throw e;
      }
    })();
    promiseList.push(promise);

    const remove = () => promiseList.filter(p => p !== promise);
    promise.then(remove, remove);

    return promise;
  };
}
