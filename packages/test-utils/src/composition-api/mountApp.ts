import { ISetupFunction, setupApp } from '@goldfishjs/composition-api';
import { APP_SETUP_ID_KEY } from '@goldfishjs/composition-api/lib/setupApp';
import setupManager from '@goldfishjs/composition-api/lib/setup/setupManager';
import {
  watch as baseWatch,
  autorun as baseAutorun,
  IWatchExpressionFn,
  IWatchCallback,
  IWatchOptions,
  AutorunFunction,
  IErrorCallback,
} from '@goldfishjs/reactive';
import AppSetup from '@goldfishjs/composition-api/lib/setup/AppSetup';

export interface IMountAppOptions {
  launchOptions?: tinyapp.IAppLaunchOptions;
}

export default function mountApp(fn: ISetupFunction, opts?: IMountAppOptions) {
  const options = setupApp(fn);
  const instance: tinyapp.IAppInstance<any> = { globalData: undefined };
  options.onLaunch?.call(instance, opts?.launchOptions || {});
  options.onShow?.call(instance, opts?.launchOptions || {});

  const stopWatchList: (() => void)[] = [];
  const stopAutorunList: (() => void)[] = [];

  return {
    get globalData() {
      return instance.globalData;
    },
    get reactiveData() {
      const setup = setupManager.get(instance.globalData[APP_SETUP_ID_KEY]) as AppSetup | null;
      if (!setup) {
        throw new Error('No setup instance.');
      }
      return setup.compositionState;
    },
    hide() {
      return options.onHide?.call(instance);
    },
    destroy() {
      stopWatchList.forEach(s => s());
      stopWatchList.splice(0, stopWatchList.length);
      stopAutorunList.forEach(s => s());
      stopAutorunList.splice(0, stopAutorunList.length);
    },
    error(e: Error) {
      return (options.onError as any)?.call(instance, e.message, e.stack);
    },
    share(params: tinyapp.OnShareAppMessageOptions) {
      return options.onShareAppMessage?.call(instance, params);
    },
    unhandledRejection() {
      return options.onUnhandledRejection?.call(instance);
    },
    watch<R>(fn: IWatchExpressionFn<R>, cb: IWatchCallback<R>, options?: IWatchOptions) {
      const stop = baseWatch(fn, cb, options);
      stopWatchList.push(stop);
      return stop;
    },
    autorun(fn: AutorunFunction, errorCb?: IErrorCallback) {
      const stop = baseAutorun(fn, errorCb);
      stopAutorunList.push(stop);
      return stop;
    },
  };
}
