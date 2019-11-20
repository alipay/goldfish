import CommonSetup from './setup/CommonSetup';
import { watchDeep } from '@goldfishjs/reactive';
import { MiniDataSetter } from '@goldfishjs/reactive-connect';
import { reactive } from './useState';

type Kind = 'page' | 'component' | 'app';

type ViewType<P, D> = {
  page: tinyapp.IPageInstance<D>;
  component: tinyapp.IComponentInstance<P, D>;
  app: tinyapp.IAppInstance<any>;
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
export default function integrateSetupFunctionResult<K extends Kind, D = any, P = any>(
  fn: ISetupFunction,
  setup: CommonSetup<any>,
  viewInstance: ViewType<P, D>[K],
  store: Object,
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
  stopList.push(...watchDeep(
    reactiveCompositionState,
    (_: any, keyPathList, newV, oldV, options) => {
      if (!(store as any).isSyncDataSafe) {
        return;
      }

      const miniDataSetter = (viewInstance as any).$$miniDataSetter
        || new MiniDataSetter(viewInstance as any);
      (viewInstance as any).$$miniDataSetter = miniDataSetter;
      miniDataSetter.set(keyPathList, newV, oldV, options);
    },
    {
      immediate: true,
      customWatch: (store as any).watch.bind(store),
    },
  ));
  return stopList;
}
