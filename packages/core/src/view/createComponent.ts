import {
  createMiniComponent,
  ComponentOptions,
  ComponentInstance,
  attachLogic,
  IProps,
  isComponent2,
} from '@goldfishjs/reactive-connect';
import AppStore from '../store/AppStore';
import ComponentStore from '../store/ComponentStore';
import { silent } from '@goldfishjs/utils';

/**
 * Connect ComponentStore with Component.
 *
 * @param storeClass
 * @param componentOptions
 * @param options
 */
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
    afterCreateStore?: (view: ComponentInstance<P, D, CS, M>, store: CS) => void;
  },
) {
  const enterKey = isComponent2 ? 'onInit' : 'didMount';
  attachLogic<typeof enterKey, Required<ComponentOptions<P, D, CS, M>>[typeof enterKey]>(
    componentOptions,
    enterKey,
    'after',
    async function (this: ComponentInstance<P, D, CS, M>) {
      const store = this.store!;
      store.isInitLoading = true;

      await silent.async(async () => {
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

  return createMiniComponent<P, CS, D, M>(
    storeClass,
    componentOptions,
    {
      ...options,
      afterCreateStore: (view, store) => {
        options && options.afterCreateStore && options.afterCreateStore(view, store);
        store.appStore = (getApp() as any).store;
      },
    },
  );
}
