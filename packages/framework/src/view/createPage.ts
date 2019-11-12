import { createMiniPage, PageOptions, PageInstance, attachLogic } from '@alipay/goldfish-reactive-connect';
import AppStore from '../store/AppStore';
import PageStore from '../store/PageStore';

export default function createPage<AS extends AppStore, PS extends PageStore<AS>, D = any>(
  storeClass: new () => PS,
  pageOptions: PageOptions<D, PS> = {},
  options?: {
    beforeCreateStore?: (view: PageInstance<D, PS>) => void;
    afterCreateStore?: (view: PageInstance<D, PS>) => void;
  },
) {
  attachLogic<'onLoad', Required<PageOptions<D, PS>>['onLoad']>(
    pageOptions,
    'onLoad',
    'after',
    async function (this: PageInstance<D, PS>) {
      const store = this.store!;
      store.globalStore = (getApp() as any).store;
      store.isInitLoading = true;
      await store.globalStore.waitForReady();
      try {
        await store.fetchInitData();
      } catch (e) {
        throw e;
      } finally {
        store.isInitLoading = false;
      }
    },
  );
  return createMiniPage<AS, PS, D>(
    storeClass,
    pageOptions,
    options,
  );
}
