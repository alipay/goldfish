import create, { ICreateFunction, IHostInstance } from './create';
import isFunction from '../common/isFunction';

export default function createApp(fn: ICreateFunction<any>): tinyapp.AppOptions {
  const options: tinyapp.AppOptions = {};
  const hooksOptions = create(fn);

  type AppInstance = IHostInstance<undefined> & tinyapp.IAppInstance<any>;

  const oldOnLaunch = options.onLaunch;
  options.onLaunch = function (this: AppInstance, options) {
    // Implement the fake `setData` method for App.
    this.setData = (data: any, cb?: () => void) => {
      this.globalData = data;
      cb && cb();
    };

    hooksOptions.init.call(this);

    if (isFunction(oldOnLaunch)) {
      oldOnLaunch.call(this, options);
    }
  };

  const oldOnShow = options.onShow;
  options.onShow = function (this: AppInstance, options) {
    if (isFunction(oldOnShow)) {
      oldOnShow.call(this, options);
    }

    hooksOptions.mounted.call(this);
  };

  // Attention: The App dose not have a destroy method.

  return options;
}
