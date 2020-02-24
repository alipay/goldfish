import watchDeep from './watchDeep';
import { ChangeOptions } from './dep';

export interface IStore {
  getState(): Record<string, any>;
  getComputed(): Record<string, any>;
  init?(): void;
  destroy?(): void;
}

type ReactiveThis = { store: Pick<IStore, Exclude<keyof IStore, 'destroy'>> };

export interface ISetData {
  (_: any, keyPathList: (string | number)[], newV: any, oldV: any, options?: ChangeOptions): void;
}

export default function reactive<T extends ReactiveThis = ReactiveThis>(
  this: T,
  setData: ISetData,
  onError?: (error: any) => void,
) {
  if (!this.store) {
    throw new Error('no store.');
  }

  this.store.init && this.store.init();

  const watchKeys = (data: Record<string, any>) => {
    const stop = watchDeep(
      data,
      setData,
      {
        onError,
        immediate: true,
      },
    );
    return [stop];
  };

  const stopWatchList: (() => void)[] = [
    ...watchKeys(this.store.getState()),
    ...watchKeys(this.store.getComputed()),
  ];
  return stopWatchList;
}
