import { createMiniApp, AppOptions, AppInstance, attachLogic } from '@goldfishjs/goldfish-reactive-connect';
import AppStore from '../store/AppStore';
import { IConfig } from '@goldfishjs/goldfish-plugins';

export default function createApp<G, S extends AppStore>(
  config: IConfig,
  storeClass: new () => S,
  appOptions: AppOptions<G, S> = {},
  options?: {
    beforeCreateStore?: (view: AppInstance<G, S>) => void;
    afterCreateStore?: (view: AppInstance<G, S>) => void;
  },
) {
  attachLogic<'onLaunch', Required<AppOptions<G, S>>['onLaunch']>(
    appOptions,
    'onLaunch',
    'after',
    async function (this: AppInstance<G, S>, options: tinyapp.IAppLaunchOptions) {
      const store = this.store!;
      store.isInitLoading = true;
      store.updatePages(options);
      await store.waitForReady();
      try {
        await store.fetchInitData();
      } catch (e) {
        throw e;
      } finally {
        store.isInitLoading = false;
      }
    },
  );

  return createMiniApp<G, S>(
    storeClass,
    appOptions,
    {
      ...options,
      afterCreateStore: (view) => {
        const store = view.store!;
        store.setConfig(config);

        if (options && options.afterCreateStore) {
          options.afterCreateStore(view);
        }
      },
    },
  );
}
