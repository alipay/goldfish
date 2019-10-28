import watch from './watch';

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
  shouldBatchUpdate = false,
  keyMap: Record<string, string> = {},
  onError?: (error: any) => void,
) {
  if (!this.store) {
    throw new Error('no store.');
  }

  this.store.init && this.store.init();

  let cacheData: Record<string, any> | undefined;
  const setSingleData = shouldBatchUpdate
    ? (key: string, value: any) => {
      if (cacheData) {
        cacheData[key] = value;
        return;
      }

      cacheData = {};
      cacheData[key] = value;
      Promise.resolve().then(() => {
        try {
          cacheData && setData.call(this, cacheData);
        } catch (e) {
          onError && onError(e);
        } finally {
          cacheData = undefined;
        }
      });
    }
    : (key: string, value: any) => {
      setData.call(this, { [key]: value });
    };

  const watchKeys = (data: Record<string, any>) => {
    const stopList: (() => void)[] = [];
    for (const key in data) {
      stopList.push(
        watch(
          () => data[key],
          () => {
            setSingleData(keyMap[key] || key, data[key]);
          },
          {
            onError,
            immediate: true,
            deep: true,
          },
        ),
      );
    }
    return stopList;
  };

  const stopWatchList: (() => void)[] = [
    ...watchKeys(this.store.getState()),
    ...watchKeys(this.store.getComputed()),
  ];
  return stopWatchList;
}
