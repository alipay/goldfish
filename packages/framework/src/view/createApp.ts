import { createMiniApp, AppOptions, AppInstance, attachLogic } from '@alipay/goldfish-reactive-connect';
import AppStore from '../store/AppStore';

export default function createApp<G, S extends AppStore>(
  storeClass: new () => S,
  appOptions: AppOptions<G, S> = {},
  options?: {
    beforeCreateStore?: (view: AppInstance<G, S>) => void;
  },
) {
  attachLogic<'onLaunch', Required<AppOptions<G, S>>['onLaunch']>(
    appOptions,
    'onLaunch',
    'after',
    async function (this: AppInstance<G, S>) {
      const store = this.store!;
      store.isInitLoading = true;
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
    options,
  );
}
