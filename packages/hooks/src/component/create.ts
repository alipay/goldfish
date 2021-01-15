import ICreateComponentFunction from './ICreateComponentFunction';
import Context from './Context';

export default function createComponent(fn: ICreateComponentFunction): tinyapp.ComponentOptions {
  const options: tinyapp.ComponentOptions & { $$context?: Context } = {};

  const oldInit = options.onInit;
  options.onInit = function(this: tinyapp.IComponentInstance<any, any>) {
    const context = new Context(this, () => {
      context.wrap(fn);
    });
    this.$$context = context;

    context.wrap(fn);
    if (oldInit) {
      oldInit.call(this);
    }
  };

  return options;
}
