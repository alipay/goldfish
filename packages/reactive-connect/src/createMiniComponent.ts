import { connect, IViewInstance, ChangeOptions } from '@goldfishjs/reactive';
import ComponentStore from './ComponentStore';
import attachLogic from './attachLogic';
import MiniDataSetter from './MiniDataSetter';

export const isComponent2 = typeof my !== 'undefined' ? my.canIUse('component2') : false;

export type ComponentInstance<P, D, CS, M> =
  { store: CS } & tinyapp.IComponentInstance<P, D> & Omit<IViewInstance, 'store'> & M;

export type ComponentOptions<P, D, CS, M extends tinyapp.IComponentMethods> =
  ThisType<ComponentInstance<P, D, CS, M>> & tinyapp.ComponentOptions<P, D, M>;

export default function createTinyappComponent<
  P,
  CS extends ComponentStore<P>,
  D = any,
  M extends tinyapp.IComponentMethods = tinyapp.IComponentMethods,
>(
  storeClass: new () => CS,
  componentOptions: ComponentOptions<P, D, CS, M>  & { onError?: (e: any) => void; } = {},
  options?: {
    beforeCreateStore?: (view: ComponentInstance<P, D, CS, M>) => void;
    afterCreateStore?: (view: ComponentInstance<P, D, CS, M>, store: CS) => void;
  },
): tinyapp.ComponentOptions {
  const beforeCreateStore = options && options.beforeCreateStore;
  const afterCreateStore = options && options.afterCreateStore;

  const enterKey = isComponent2 ? 'onInit' : 'didMount';
  const leaveKey = 'didUnmount';
  connect(
    componentOptions,
    enterKey,
    leaveKey,
    function (
      this: tinyapp.IComponentInstance<P, D> & {
        setData: tinyapp.SetDataMethod<D>;
        store: CS;
        $$miniDataSetter?: MiniDataSetter<tinyapp.IComponentInstance<P, D>>
      },
      _: any,
      keyPathList: (string | number)[],
      newV: any,
      oldV: any,
      options?: ChangeOptions,
    ) {
      if (!this.store.isSyncDataSafe) {
        return;
      }

      const miniDataSetter = this.$$miniDataSetter || new MiniDataSetter(this);
      this.$$miniDataSetter = miniDataSetter;
      miniDataSetter.set(keyPathList, newV, oldV, options);
    },
    (instance) => {
      beforeCreateStore && beforeCreateStore(instance as ComponentInstance<P, D, CS, M>);
      const store = new storeClass();
      afterCreateStore && afterCreateStore(instance as ComponentInstance<P, D, CS, M>, store);
      return store;
    },
    {
      onError: componentOptions.onError,
    },
  );

  function syncProps(this: ComponentInstance<P, D, CS, M>) {
    for (const key in this.props) {
      if (key in this.store.props) {
        this.store.props[key] = this.props[key];
      }
    }
  }

  attachLogic<typeof enterKey, Required<ComponentOptions<P, D, CS, M>>[typeof enterKey]>(
    componentOptions,
    enterKey,
    'after',
    syncProps,
  );

  const refreshKey = isComponent2 ? 'didUpdate' : 'deriveDataFromProps';
  attachLogic<typeof refreshKey, Required<ComponentOptions<P, D, CS, M>>[typeof refreshKey]>(
    componentOptions,
    refreshKey,
    'after',
    syncProps,
  );

  return componentOptions;
}
