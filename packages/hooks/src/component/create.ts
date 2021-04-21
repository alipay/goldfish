import EffectContext from './EffectContext';
import ICreateComponentFunction from './ICreateComponentFunction';
import StateContext from './StateContext';

export const isComponent2 = typeof my !== 'undefined' ? !!my?.canIUse('component2') : false;

export default function createComponent<P>(fn: ICreateComponentFunction<P>): tinyapp.ComponentOptions {
  const options: tinyapp.ComponentOptions = {};

  type ComponentInstance = tinyapp.IComponentInstance<any, any> & {
    $$stateContext?: StateContext;
    $$effectContext?: EffectContext;
  };

  const executeFn = function (this: ComponentInstance, fn: () => ReturnType<ICreateComponentFunction<any>>) {
    let wrappedFn = this.$$stateContext?.wrap(fn) || fn;
    wrappedFn = this.$$effectContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn();
  };

  const initMethod = isComponent2 ? 'onInit' : 'didMount';
  const oldInitMethod = options[initMethod];
  options[initMethod] = function (this: ComponentInstance) {
    const effectContext = new EffectContext();
    this.$$effectContext = effectContext;

    const stateContext = new StateContext(this, () => {
      executeFn.call(this, () => fn(this.props));
    });
    this.$$stateContext = stateContext;

    if (!isComponent2) {
      executeFn.call(this, () => fn(this.props));
    }

    if (oldInitMethod) {
      oldInitMethod.call(this);
    }
  };

  const oldDidMount = options.didMount;
  options.didMount = function (this: ComponentInstance) {
    if (oldDidMount) {
      oldDidMount.call(this);
    }

    this.$$effectContext?.executeEffect();
  };

  const oldUnmount = options.didUnmount;
  options.didUnmount = function (this: ComponentInstance) {
    this.$$stateContext?.destroy();
    this.$$effectContext?.destroy();

    if (oldUnmount) {
      oldUnmount.call(this);
    }
  };

  const syncPropsMethod = isComponent2 ? 'deriveDataFromProps' : 'didUpdate';
  const oldSyncPropsMethod = options[syncPropsMethod];
  options[syncPropsMethod] = function (this: ComponentInstance, nextProps: any) {
    if (isComponent2) {
      executeFn.call(this, () => fn(nextProps));
    } else {
      executeFn.call(this, () => fn(this.props));
    }

    if (oldSyncPropsMethod) {
      (oldSyncPropsMethod as any).call(this, nextProps);
    }
  };

  const oldDidUpdate = options.didUpdate;
  options.didUpdate = function (
    this: ComponentInstance,
    ...args: Parameters<Required<tinyapp.ComponentOptions>['didUpdate']>
  ) {
    if (oldDidUpdate) {
      oldDidUpdate.call(this, ...args);
    }
    this.$$effectContext?.executeEffect();
  };

  return options;
}
