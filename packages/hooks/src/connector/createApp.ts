import { get as keyPathGet } from '@goldfishjs/reactive-connect/lib/MiniDataSetter/keyPath';
import create, { CreateFunction } from './create';
import isFunction from '../common/isFunction';
import companionObjectManager from './companionObjectManager';

const appNotReadyError = new Error('The app is not ready.');

export default function createApp(fn: () => ReturnType<CreateFunction>): tinyapp.AppOptions {
  const options: tinyapp.AppOptions = {};
  const hooksOptions = create(fn, 'app');

  // Create the componion object.
  const companionObject = companionObjectManager.create({
    setData() {
      throw appNotReadyError;
    },
    spliceData() {
      throw appNotReadyError;
    },
    batchedUpdates() {
      throw appNotReadyError;
    },
  });

  // Initialize the componion object.
  hooksOptions.init.call(companionObject);

  type AppInstance = tinyapp.IAppInstance<any> & Pick<tinyapp.IAppOptionsMethods, 'onShareAppMessage'>;

  const oldOnLaunch = options.onLaunch;
  options.onLaunch = function (this: AppInstance, options) {
    // Mount the methods.
    const mountMethods = (methods: Record<string, Function>) => {
      for (const key in methods) {
        (this as any)[key] = methods[key];
      }
    };
    mountMethods(companionObject.methods);
    companionObject.addMethodsChangeListener(mountMethods);

    // Set the real data sync methods.
    Object.assign(companionObject, {
      setData: (obj: any, cb?: () => void) => {
        for (const key in obj) {
          const keyPathList = keyPathGet(key);
          keyPathList.reduce((prevData, keySeg, index, list) => {
            if (index === list.length - 1) {
              prevData[keySeg] = obj[key];
            }
            return prevData[keySeg];
          }, this.globalData);
        }
        cb && cb();
      },
      spliceData: (obj: Record<string, [number, number, ...any[]]>, cb?: () => void) => {
        for (const key in obj) {
          const keyPathList = keyPathGet(key);
          keyPathList.reduce((prevData, keySeg, index, list) => {
            if (index === list.length - 1) {
              prevData[keySeg].splice(obj[key][0], obj[key][1], ...obj[key].slice(2));
            }
            return prevData[keySeg];
          }, this.globalData);
        }
        cb && cb();
      },
      batchedUpdates: (cb: () => void) => cb(),
    });

    // It is safe to sync data from now on.
    companionObject.status = 'ready';

    // If there are some onShareAppMessage methods configured, mount them on the app instance.
    if (companionObject.appEventContext?.hasEventCallback('onShareAppMessage')) {
      const oldOnShareAppMessage = this.onShareAppMessage;
      this.onShareAppMessage = function (this: AppInstance, options) {
        const previousResult = isFunction(oldOnShareAppMessage) ? oldOnShareAppMessage.call(this, options) : {};
        return {
          ...previousResult,
          ...companionObject.appEventContext?.call('onShareAppMessage', this, options),
        };
      };
    }

    if (isFunction(oldOnLaunch)) {
      oldOnLaunch.call(this, options);
    }

    // Call the lifecycle methods.
    companionObject.appEventContext?.call('onLaunch', this, options);
  };

  const oldOnShow = options.onShow;
  options.onShow = function (this: AppInstance, options) {
    if (isFunction(oldOnShow)) {
      oldOnShow.call(this, options);
    }

    hooksOptions.mounted.call(companionObject);

    // Call the lifecycle methods.
    companionObject.appEventContext?.call('onShow', this, options);
  };

  const oldOnHide = options.onHide;
  options.onHide = function (this: AppInstance) {
    if (isFunction(oldOnHide)) {
      oldOnHide.call(this);
    }

    // Call the lifecycle methods.
    companionObject.appEventContext?.call('onHide', this);
  };

  const oldOnError = options.onError;
  options.onError = function (this: AppInstance, error: any) {
    if (isFunction(oldOnError)) {
      oldOnError.call(this, error);
    }

    // Call the lifecycle methods.
    companionObject.appEventContext?.call('onError', this, error);
  };

  const oldOnUnhandledRejection = options.onUnhandledRejection;
  options.onUnhandledRejection = function (this: AppInstance, res: any) {
    if (isFunction(oldOnUnhandledRejection)) {
      oldOnUnhandledRejection.call(this, res);
    }

    // Call the lifecycle methods.
    companionObject.appEventContext?.call('onUnhandledRejection', this, res);
  };

  // Attention: The App dose not have any destroy method.

  return options;
}
