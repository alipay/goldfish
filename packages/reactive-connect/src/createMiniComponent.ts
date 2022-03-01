import { connect, IViewInstance, ChangeOptions } from '@goldfishjs/reactive';
import ComponentStore from './ComponentStore';
import attachLogic from './attachLogic';
import getMiniDataSetter from './getMiniDataSetter';

export const isComponent2 = typeof my !== 'undefined' ? my.canIUse('component2') : false;

export type ComponentInstance<P, D, CS, M> = { store: CS } & tinyapp.IComponentInstance<P, D> &
  Omit<IViewInstance, 'store'> &
  M;

export type ComponentOptions<P, D, CS, M extends tinyapp.IComponentMethods> = ThisType<ComponentInstance<P, D, CS, M>> &
  tinyapp.ComponentOptions<P, D, M>;

export default function createTinyappComponent<
  P,
  CS extends ComponentStore<P>,
  D = any,
  M extends tinyapp.IComponentMethods = tinyapp.IComponentMethods,
>(
  storeClass: new () => CS,
  componentOptions: ComponentOptions<P, D, CS, M> & { onError?: (e: any) => void } = {},
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
      },
      obj: any,
      keyPathList: (string | number)[],
      newV: any,
      oldV: any,
      options?: ChangeOptions,
    ) {
      if (!this.store.isSyncDataSafe) {
        return;
      }

      const miniDataSetter = getMiniDataSetter();
      miniDataSetter.set(this, obj, keyPathList, newV, oldV, options);
    },
    instance => {
      beforeCreateStore && beforeCreateStore(instance as ComponentInstance<P, D, CS, M>);
      const store = new storeClass();
      afterCreateStore && afterCreateStore(instance as ComponentInstance<P, D, CS, M>, store);
      return store;
    },
    {
      onError: componentOptions.onError,
    },
  );

  function syncProps(lifeCycleName: 'onInit' | 'didMount' | 'deriveDataFromProps' | 'didUpdate') {
    return function (this: ComponentInstance<P, D, CS, M>, ...args: any[]) {
      const nextProps: P = {
        onInit: this.props,
        didMount: this.props,
        deriveDataFromProps: args[0],
        didUpdate: this.props,
      }[lifeCycleName];

      for (const key in nextProps) {
        if (key in this.store.props) {
          this.store.props[key] = nextProps[key];
        }
      }
    };
  }

  attachLogic<typeof enterKey, Required<ComponentOptions<P, D, CS, M>>[typeof enterKey]>(
    componentOptions,
    enterKey,
    'after',
    syncProps(enterKey),
  );

  const refreshKey = isComponent2 ? 'deriveDataFromProps' : 'didUpdate';
  attachLogic<typeof refreshKey, Required<ComponentOptions<P, D, CS, M>>[typeof refreshKey]>(
    componentOptions,
    refreshKey,
    'after',
    syncProps(refreshKey),
  );

  attachLogic<typeof leaveKey, Required<ComponentOptions<P, D, CS, M>>[typeof leaveKey]>(
    componentOptions,
    leaveKey,
    'after',
    function (this: ComponentInstance<P, D, CS, M>) {
      this.store && (this.store.isSyncDataSafe = false);
    },
  );

  return componentOptions;
}
