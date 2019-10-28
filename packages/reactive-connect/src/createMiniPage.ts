import { connect, IViewInstance } from '@alipay/goldfish-reactive';
import PageStore from './PageStore';

export type PageInstance<D, S> =
  tinyapp.IPageInstance<D> & Omit<IViewInstance, 'store'> & { store: S };

export type PageOption<D, S> =
  ThisType<tinyapp.IPageInstance<D> & { store: S }> & tinyapp.PageOptions<D>;

export default function createMiniPage<PS extends PageStore, D = any>(
  storeClass: new () => PS,
  pageOptions: PageOption<D, PS> = {},
  options?: {
    beforeCreateStore?: (view: PageInstance<D, PS>) => void;
  },
): tinyapp.PageOptions<D> {
  const preOnUnload = pageOptions.onUnload;
  pageOptions.onUnload = function (this: PageInstance<D, PS>) {
    this.store && (this.store.isSyncDataSafe = false);

    if (preOnUnload) {
      preOnUnload.call(this);
    }
  };

  const beforeCreateStore = options && options.beforeCreateStore;
  connect(
    pageOptions,
    'onLoad',
    'onUnload',
    function (this: { setData: tinyapp.SetDataMethod<D>; store: PS; }, data: any) {
      if (!this.store.isSyncDataSafe) {
        return;
      }

      const isObject = (val: any) => val && typeof val === 'object';
      if (isObject(data)) {
        const realData = { ...data };
        for (const k in realData) {
          if (isObject(realData[k])) {
            realData[k] = Array.isArray(realData[k]) ? [...realData[k]] : { ...realData[k] };
          }
        }
        this.setData(realData);
      } else {
        this.setData(data);
      }
    },
    (instance) => {
      beforeCreateStore && beforeCreateStore(instance as PageInstance<D, PS>);
      const store = new storeClass();
      store.globalStore = (getApp() as any).store;
      return store;
    },
    {
      onError: pageOptions.onError,
      shouldBatchUpdate: true,
    },
  );

  return pageOptions;
}
