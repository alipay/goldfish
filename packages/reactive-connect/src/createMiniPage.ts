import { connect, IViewInstance, ChangeOptions } from '@goldfishjs/reactive';
import PageStore from './PageStore';
import attachLogic from './attachLogic';
import AppStore from './AppStore';
import MiniDataSetter from './MiniDataSetter';

export type PageInstance<D, S> =
  tinyapp.IPageInstance<D> & Omit<IViewInstance, 'store'> & { store: S };

export type PageOptions<D, S> =
  ThisType<tinyapp.IPageInstance<D> & { store: S }> & tinyapp.PageOptions<D>;

export default function createMiniPage<AS extends AppStore, PS extends PageStore<AS>, D = any>(
  storeClass: new () => PS,
  pageOptions: PageOptions<D, PS> = {},
  options?: {
    beforeCreateStore?: (view: PageInstance<D, PS>) => void;
    afterCreateStore?: (view: PageInstance<D, PS>, store: PS) => void;
  },
): tinyapp.PageOptions<D> {
  attachLogic<'onUnload', Required<PageOptions<D, PS>>['onUnload']>(
    pageOptions,
    'onUnload',
    'before',
    function (this: PageInstance<D, PS>) {
      this.store && (this.store.isSyncDataSafe = false);
    },
  );

  const beforeCreateStore = options && options.beforeCreateStore;
  const afterCreateStore = options && options.afterCreateStore;
  connect(
    pageOptions,
    'onLoad',
    'onUnload',
    function (
      this: tinyapp.IPageInstance<D> & {
        setData: tinyapp.SetDataMethod<D>;
        store: PS;
        $$miniDataSetter?: MiniDataSetter<tinyapp.IPageInstance<D>>
      },
      _: any,
      keyPathList: (string | number)[],
      newV: any,
      oldV: any,
      options?: ChangeOptions,
    ) {
      if (!this.store.isSyncDataSafe) {
        return;
      }

      const miniDataSetter = this.$$miniDataSetter || new MiniDataSetter(this);
      this.$$miniDataSetter = miniDataSetter;
      miniDataSetter.set(keyPathList, newV, oldV, options);
    },
    (instance) => {
      beforeCreateStore && beforeCreateStore(instance as PageInstance<D, PS>);
      const store = new storeClass();
      afterCreateStore && afterCreateStore(instance as PageInstance<D, PS>, store);

      store.globalStore = (getApp() as any).store;
      return store;
    },
    {
      onError: pageOptions.onError,
    },
  );

  return pageOptions;
}
