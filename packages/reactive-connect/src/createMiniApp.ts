import { connect, IViewInstance } from '@alipay/goldfish-reactive';
import AppStore from './AppStore';

export type AppInstance<G, S extends AppStore> =
  tinyapp.IAppInstance<G> & IViewInstance & { store?: S };

export type AppOptions<G, S> =
  ThisType<tinyapp.IAppInstance<G> & { store: S }> & tinyapp.AppOptions<G>;

export default function createMiniApp<G, S extends AppStore>(
  storeClass: new () => S,
  appOptions: AppOptions<G, S> = {},
  options?: {
    beforeCreateStore?: (view: AppInstance<G, S>) => void;
  },
): tinyapp.AppOptions<G> {
  const beforeCreateStore = options && options.beforeCreateStore;

  const preOnLaunch = appOptions.onLaunch;
  appOptions.onLaunch = function (this: AppInstance<G, S>, opts) {
    beforeCreateStore && beforeCreateStore(this);
    this.store = new storeClass();

    if (preOnLaunch) {
      preOnLaunch.call(this, opts);
    }
  };

  return appOptions;
}
