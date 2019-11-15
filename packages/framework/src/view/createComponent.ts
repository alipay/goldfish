import {
  createMiniComponent,
  ComponentOptions,
  ComponentInstance,
  attachLogic,
  IProps,
  isComponent2,
} from '@alipay/goldfish-reactive-connect';
import AppStore from '../store/AppStore';
import ComponentStore from '../store/ComponentStore';

export default function createComponent<
  AS extends AppStore,
  CS extends ComponentStore<P, AS>,
  P extends IProps = {},
  D = any,
  M extends tinyapp.IComponentMethods = {}
>(
  storeClass: new () => CS,
  componentOptions: ComponentOptions<P, D, CS, M> = {},
  options?: {
    beforeCreateStore?: (view: ComponentInstance<P, D, CS, M>) => void;
  },
) {
  const enterKey = isComponent2 ? 'onInit' : 'didMount';
  attachLogic<typeof enterKey, Required<ComponentOptions<P, D, CS, M>>[typeof enterKey]>(
    componentOptions,
    enterKey,
    'after',
    async function (this: ComponentInstance<P, D, CS, M>) {
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

  return createMiniComponent<P, CS, D, M>(
    storeClass,
    componentOptions,
    options,
  );
}
