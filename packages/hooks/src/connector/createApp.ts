import create, { CreateFunction, IHostInstance } from './create';
import isFunction from '../common/isFunction';

export default function createApp(fn: () => ReturnType<CreateFunction>): tinyapp.AppOptions {
  const options: tinyapp.AppOptions = {};
  const hooksOptions = create(fn, 'app');

  type AppInstance = IHostInstance<undefined> &
    tinyapp.IAppInstance<any> &
    Pick<tinyapp.IAppOptionsMethods, 'onShareAppMessage'>;

  const oldOnLaunch = options.onLaunch;
  options.onLaunch = function (this: AppInstance, options) {
    // Implement the fake `setData` method for App.
    this.setData = (data: any, cb?: () => void) => {
      this.globalData = data;
      cb && cb();
    };

    hooksOptions.init.call(this);

    if (this.$$appEventContext?.hasEventCallback('onShareAppMessage')) {
      const oldOnShareAppMessage = this.onShareAppMessage;
      this.onShareAppMessage = function (this: AppInstance, options) {
        if (isFunction(oldOnShareAppMessage)) {
          oldOnShareAppMessage.call(this, options);
        }

        return this.$$appEventContext?.call('onShareAppMessage', this, options);
      };
    }

    if (isFunction(oldOnLaunch)) {
      oldOnLaunch.call(this, options);
    }

    this.$$appEventContext?.call('onLaunch', this, options);
  };

  const oldOnShow = options.onShow;
  options.onShow = function (this: AppInstance, options) {
    if (isFunction(oldOnShow)) {
      oldOnShow.call(this, options);
    }

    hooksOptions.mounted.call(this);

    this.$$appEventContext?.call('onShow', this, options);
  };

  const oldOnHide = options.onHide;
  options.onHide = function (this: AppInstance) {
    if (isFunction(oldOnHide)) {
      oldOnHide.call(this);
    }

    this.$$appEventContext?.call('onHide', this);
  };

  const oldOnError = options.onError;
  options.onError = function (this: AppInstance, error: any) {
    if (isFunction(oldOnError)) {
      oldOnError.call(this, error);
    }

    this.$$appEventContext?.call('onError', this, error);
  };

  const oldOnUnhandledRejection = options.onUnhandledRejection;
  options.onUnhandledRejection = function (this: AppInstance, res: any) {
    if (isFunction(oldOnUnhandledRejection)) {
      oldOnUnhandledRejection.call(this, res);
    }

    this.$$appEventContext?.call('onUnhandledRejection', this, res);
  };

  // Attention: The App dose not have a destroy method.

  return options;
}
