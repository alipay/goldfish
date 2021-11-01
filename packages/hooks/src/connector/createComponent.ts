import create, { CreateFunction, IHostInstance } from './create';
import isFunction from '../common/isFunction';

export const isComponent2 = typeof my !== 'undefined' && !!my?.canIUse('component2');

export default function createComponent<P>(fn: (props: P) => ReturnType<CreateFunction>): tinyapp.ComponentOptions {
  const options: tinyapp.ComponentOptions = {};
  const hooksOptions = create<P>(fn, 'component');

  type ComponentInstance = IHostInstance<P> & tinyapp.IComponentInstance<P, any>;

  const initMethod = isComponent2 ? 'onInit' : 'didMount';
  const oldInitMethod = options[initMethod];
  options[initMethod] = function (this: ComponentInstance) {
    hooksOptions.init.call(this);

    if (isFunction(oldInitMethod)) {
      oldInitMethod.call(this);
    }
  };

  const oldDidMount = options.didMount;
  options.didMount = function (this: ComponentInstance) {
    if (isFunction(oldDidMount)) {
      oldDidMount.call(this);
    }

    hooksOptions.mounted.call(this);
  };

  const oldUnmount = options.didUnmount;
  options.didUnmount = function (this: ComponentInstance) {
    hooksOptions.unmounted.call(this);

    if (isFunction(oldUnmount)) {
      oldUnmount.call(this);
    }
  };

  const syncPropsMethod = isComponent2 ? 'deriveDataFromProps' : 'didUpdate';
  const oldSyncPropsMethod = options[syncPropsMethod];
  options[syncPropsMethod] = function (this: ComponentInstance, nextProps: any) {
    hooksOptions.syncProps.call(this, isComponent2 ? nextProps : this.props);

    if (isFunction(oldSyncPropsMethod)) {
      (oldSyncPropsMethod as any).call(this, nextProps);
    }
  };

  const oldDidUpdateMethod = options.didUpdate;
  options.didUpdate = function (this: ComponentInstance, prevProps: Partial<{}>, prevData: Partial<{}>) {
    if (prevProps !== this.props) {
      hooksOptions.executeEffect.call(this);
    }

    if (isFunction(oldDidUpdateMethod)) {
      oldDidUpdateMethod.call(this, prevProps, prevData);
    }
  };

  return options;
}
