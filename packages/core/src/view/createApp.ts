import { createMiniApp, AppOptions, AppInstance, attachLogic } from '@goldfishjs/reactive-connect';
import AppStore from '../store/AppStore';
import { IConfig } from '@goldfishjs/plugins';

/**
 * Connect the AppStore with the App.
 *
 * @param config The configuration for the whole App.
 * @param storeClass The AppStore.
 * @param appOptions The options to configure the App.
 * @param options?
 */
export default function createApp<G, S extends AppStore>(
  config: IConfig,
  storeClass: new () => S,
  appOptions: AppOptions<G, S> = {},
  options?: {
    beforeCreateStore?: (view: AppInstance<G, S>) => void;
    afterCreateStore?: (view: AppInstance<G, S>, store: S) => void;
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

      // Call onError when there is uncaught error in Promise.
      const app = getApp();
      store.watch(
        () => store.globalErrorInPromise,
        (error) => {
          const onError = (app as any).onError;
          if (error && onError) {
            onError(error);
          }
        },
        {
          immediate: true,
        },
      );

      await store.waitForReady();
      store.initFeedback();
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
      afterCreateStore: (view, store) => {
        store.setConfig(config);

        if (options && options.afterCreateStore) {
          options.afterCreateStore(view, store);
        }
      },
    },
  );
}
