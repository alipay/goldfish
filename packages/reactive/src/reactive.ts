import { default as optimizedSetData } from './setData';
import watchDeep from './watchDeep';
import generateKeyPathString from './generateKeyPathString';

export interface IStore {
  getState(): Record<string, any>;
  getComputed(): Record<string, any>;
  init?(): void;
  destroy?(): void;
}

type ReactiveThis = { store: Pick<IStore, Exclude<keyof IStore, 'destroy'>> };
export default function reactive<T extends ReactiveThis = ReactiveThis>(
  this: T,
  setData: (this: T, data: Record<string, any>) => void,
  onError?: (error: any) => void,
) {
  if (!this.store) {
    throw new Error('no store.');
  }

  this.store.init && this.store.init();

  const watchKeys = (data: Record<string, any>) => {
    const stopList = watchDeep(
      data,
      (_: any, keyPathList: (string | number)[], newV) => {
        try {
          const keyPath = generateKeyPathString(keyPathList);
          optimizedSetData(keyPath.replace(/^./, ''), newV, setData.bind(this));
        } catch (e) {
          onError && onError(e);
          optimizedSetData(keyPathList[0] as string, data[keyPathList[0]], setData.bind(this));
        }
      },
      {
        onError,
        immediate: true,
      },
    );
    return stopList;
  };

  const stopWatchList: (() => void)[] = [
    ...watchKeys(this.store.getState()),
    ...watchKeys(this.store.getComputed()),
  ];
  return stopWatchList;
}
