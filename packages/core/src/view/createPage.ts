import { createMiniPage, PageOptions, PageInstance, attachLogic } from '@goldfishjs/reactive-connect';
import { silent } from '@goldfishjs/utils';
import AppStore from '../store/AppStore';
import PageStore from '../store/PageStore';

/**
 * Connect PageStore with Page.
 *
 * @param storeClass
 * @param pageOptions
 * @param options
 */
export default function createPage<AS extends AppStore, PS extends PageStore<AS>, D = any>(
  storeClass: new () => PS,
  pageOptions: PageOptions<D, PS> = {},
  options?: {
    beforeCreateStore?: (view: PageInstance<D, PS>) => void;
    afterCreateStore?: (view: PageInstance<D, PS>, store: PS) => void;
  },
) {
  attachLogic<'onLoad', Required<PageOptions<D, PS>>['onLoad']>(
    pageOptions,
    'onLoad',
    'after',
    async function (this: PageInstance<D, PS>, query) {
      const store = this.store!;
      store.isInitLoading = true;

      await silent.async(async () => {
        store.appStore.updatePages({ query });
        await store.appStore.waitForReady();
      })();

      try {
        await store.fetchInitData();
      } catch (e) {
        throw e;
      } finally {
        store.isInitLoading = false;
      }
    },
  );
  return createMiniPage<AS, PS, D>(storeClass, pageOptions, {
    ...options,
    afterCreateStore: (view, store) => {
      options && options.afterCreateStore && options.afterCreateStore(view, store);
      store.appStore = (getApp() as any).store;
    },
  });
}
