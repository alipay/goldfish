import ICreateComponentFunction from './ICreateComponentFunction';
import Context from './Context';

export const isComponent2 = typeof my !== 'undefined' ? my.canIUse('component2') : false;

export default function createComponent<P>(fn: ICreateComponentFunction<P>): tinyapp.ComponentOptions {
  const options: tinyapp.ComponentOptions = {};

  type ComponentInstance = tinyapp.IComponentInstance<any, any> & { $$context?: Context };

  const initMethod = isComponent2 ? 'onInit' : 'didMount';
  const oldInitMethod = options[initMethod];
  options[initMethod] = function(this: ComponentInstance) {
    const context = new Context(this, () => {
      context.wrap(() => fn(this.props));
    });
    this.$$context = context;

    if (!isComponent2) {
      context.wrap(fn);
    }

    if (oldInitMethod) {
      oldInitMethod.call(this);
    }
  };

  const oldUnmount = options.didUnmount;
  options.didUnmount = function(this: ComponentInstance) {
    this.$$context && this.$$context.destroy();

    if (oldUnmount) {
      oldUnmount.call(this);
    }
  };

  const syncPropsMethod = isComponent2 ? 'deriveDataFromProps' : 'didUpdate';
  const oldSyncPropsMethod = options[syncPropsMethod];
  options[syncPropsMethod] = function(this: ComponentInstance, nextProps: any) {
    if (isComponent2) {
      this.$$context?.wrap(() => fn(nextProps));
    } else {
      this.$$context?.wrap(() => fn(this.props));
    }

    if (oldSyncPropsMethod) {
      (oldSyncPropsMethod as any).call(this, nextProps);
    }
  };

  return options;
}
