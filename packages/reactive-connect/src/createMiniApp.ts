import { IViewInstance } from '@alipay/goldfish-reactive';
import AppStore from './AppStore';
import attachLogic from './attachLogic';

export type AppInstance<G, S extends AppStore> =
  tinyapp.IAppInstance<G> & IViewInstance & { store?: S };

export type AppOptions<G, S> =
  ThisType<tinyapp.IAppInstance<G> & { store: S }> & tinyapp.AppOptions<G>;

export default function createMiniApp<G, S extends AppStore>(
  storeClass: new () => S,
  appOptions: AppOptions<G, S> = {},
  options?: {
    beforeCreateStore?: (view: AppInstance<G, S>) => void;
    afterCreateStore?: (view: AppInstance<G, S>) => void;
  },
): tinyapp.AppOptions<G> {
  const beforeCreateStore = options && options.beforeCreateStore;
  const afterCreateStore = options && options.afterCreateStore;

  attachLogic<'onLaunch', Required<AppOptions<G, S>>['onLaunch']>(
    appOptions,
    'onLaunch',
    'before',
    function (
      this: AppInstance<G, S>,
    ) {
      beforeCreateStore && beforeCreateStore(this);
      this.store = new storeClass();
      afterCreateStore && afterCreateStore(this);
      this.store.init();
    },
  );

  return appOptions;
}
