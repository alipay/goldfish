import { watchDeep } from '@goldfishjs/reactive';
import { getMiniDataSetter } from '@goldfishjs/reactive-connect';
import { reactive } from './useState';
import PageSetup, { SetupPageInstance, SetupPageStore } from './setup/PageSetup';
import ComponentSetup, {
  SetupComponentInstance,
  SetupComponentStore,
} from './setup/ComponentSetup';
import AppSetup, { SetupAppInstance, SetupAppStore } from './setup/AppSetup';

type Kind = 'page' | 'component' | 'app';

type ViewType = {
  page: SetupPageInstance;
  component: SetupComponentInstance;
  app: SetupAppInstance;
};

type StoreType = {
  page: SetupPageStore;
  component: SetupComponentStore;
  app: SetupAppStore;
};

type SetupType = {
  page: PageSetup;
  component: ComponentSetup;
  app: AppSetup;
};

export interface ISetupFunction {
  (): Record<string, any>;
}

/**
 * 1. Execute the setup function.
 * 2. Convert the result of setup function to the observable data on the store.
 *
 * @param fn
 * @param setup
 * @param viewInstance
 * @param store
 */
export default function integrateSetupFunctionResult<K extends Kind>(
  fn: ISetupFunction,
  setup: SetupType[K],
  viewInstance: ViewType[K],
  store: StoreType[K],
): (() => void)[];
export default function integrateSetupFunctionResult(
  fn: ISetupFunction,
  setup: any,
  viewInstance: any,
  store: any,
) {
  setup.setStoreInstance(store);
  setup.setViewInstance(viewInstance);

  let config: Record<string, any> = {};
  config = fn();

  const compositionState: Record<string, any> = {};
  for (const k in config) {
    const value = config[k];
    if (typeof value === 'function') {
      Object.defineProperty(viewInstance, k, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      compositionState[k] = config[k];
    }
  }
  // Convert the returned data to reactive one.
  const reactiveCompositionState = reactive(compositionState);
  (store as any).$$compositionState = reactiveCompositionState;

  const stopList: (() => void)[] = [];
  stopList.push(watchDeep(
    reactiveCompositionState,
    (obj: any, keyPathList, newV, oldV, options) => {
      if (!(store as any).isSyncDataSafe) {
        return;
      }

      const miniDataSetter = getMiniDataSetter();
      miniDataSetter.set(viewInstance, obj, keyPathList, newV, oldV, options);
    },
    {
      immediate: true,
    },
  ));
  return stopList;
}
