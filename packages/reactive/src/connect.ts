import { IStore, default as reactive, ISetData } from './reactive';

export interface IViewInstance {
  store?: IStore;
  stopWatchList: (() => void)[];
}

export default function connect<E extends string, L extends string>(
  target: Partial<Record<E | L, Function>>,
  enterKey: E,
  leaveKey: L,
  setData: ISetData,
  createStore: (instance: IViewInstance) => IStore,
  options: {
    onError?: (error: any) => void;
  } = {},
) {
  const onError = options.onError;

  const prevEnterFunction = target[enterKey];
  target[enterKey] = function (this: IViewInstance, ...args: any[]) {
    this.store = createStore(this);
    this.stopWatchList = reactive.call(
      this as { store: IStore },
      setData.bind(this),
      onError,
    );

    if (prevEnterFunction) {
      try {
        prevEnterFunction.call(this, ...args);
      } catch (e) {
        onError && onError(e);
      }
    }
  };

  const prevLeaveFunction = target[leaveKey];
  target[leaveKey] = function (this: IViewInstance, ...args: any[]) {
    if (this.stopWatchList) {
      this.stopWatchList.forEach((stop: () => void) => stop());
    }

    if (this.store && this.store.destroy) {
      try {
        this.store.destroy();
      } catch (e) {
        onError && onError(e);
      }
    }

    if (prevLeaveFunction) {
      try {
        prevLeaveFunction.call(this, ...args);
      } catch (e) {
        onError && onError(e);
      }
    }
  };
}
