import create, { ICreateFunction, IHostInstance } from './create';

export default function createComponent(fn: ICreateFunction<undefined>): tinyapp.PageOptions {
  const options: tinyapp.PageOptions = {};
  const hooksOptions = create(fn);

  type PageInstance = IHostInstance<undefined> & tinyapp.IPageInstance<any>;

  const oldOnLoad = options.onLoad;
  options.onLoad = function (this: PageInstance, query) {
    hooksOptions.init.call(this);

    if (oldOnLoad) {
      oldOnLoad.call(this, query);
    }
  };

  const oldOnReady = options.onReady;
  options.onReady = function (this: PageInstance) {
    if (oldOnReady) {
      oldOnReady.call(this);
    }

    hooksOptions.mounted.call(this);
  };

  const oldOnUnload = options.onUnload;
  options.onUnload = function (this: PageInstance) {
    hooksOptions.unmounted.call(this);

    if (oldOnUnload) {
      oldOnUnload.call(this);
    }
  };

  return options;
}
