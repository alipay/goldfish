import { connect, IViewInstance } from '@alipay/goldfish-reactive';
import ComponentStore from './ComponentStore';

const isComponent2 = typeof my !== 'undefined' ? my.canIUse('component2') : false;

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
  },
): tinyapp.ComponentOptions {
  const beforeCreateStore = options && options.beforeCreateStore;
  const enterKey = isComponent2 ? 'onInit' : 'didMount';
  const leaveKey = 'didUnmount';
  connect(
    componentOptions,
    enterKey,
    leaveKey,
    function (this: { setData: tinyapp.SetDataMethod<D>; store: CS; }, data: any) {
      if (!this.store.isSyncDataSafe) {
        return;
      }

      const isObject = (val: any) => val && typeof val === 'object';
      if (isObject(data)) {
        const realData = { ...data };
        for (const k in realData) {
          if (isObject(realData[k])) {
            realData[k] = Array.isArray(realData[k]) ? [...realData[k]] : { ...realData[k] };
          }
        }
        this.setData(realData);
      } else {
        this.setData(data);
      }
    },
    (instance) => {
      beforeCreateStore && beforeCreateStore(instance as ComponentInstance<P, D, CS, M>);
      const store = new storeClass();
      return store;
    },
    {
      onError: componentOptions.onError,
      shouldBatchUpdate: true,
    },
  );

  function syncProps(this: ComponentInstance<P, D, CS, M>) {
    for (const key in this.props) {
      if (key in this.store.props) {
        this.store.props[key] = this.props[key];
      }
    }
  }

  const preEnter = componentOptions[enterKey];
  componentOptions[enterKey] = function (this: ComponentInstance<P, D, CS, M>) {
    if (preEnter) {
      preEnter.call(this);
    }
    syncProps.call(this);
  };

  const refreshKey = isComponent2 ? 'didUpdate' : 'deriveDataFromProps';
  const preRefresh = componentOptions[refreshKey];
  componentOptions[refreshKey] = function (this: ComponentInstance<P, D, CS, M>, nextProps: P) {
    if (preRefresh) {
      refreshKey === 'didUpdate'
        ? (preRefresh as any).call(this)
        : (preRefresh as any).call(this, nextProps);
    }
  };

  return componentOptions;
}
