import { AppStore, createApp } from '@goldfishjs/core';
import { IConfig, PluginClass } from '@goldfishjs/plugins';
import { AppInstance, observable, attachLogic } from '@goldfishjs/reactive-connect';
import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import AppSetup from './setup/AppSetup';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import appendFn from './appendFn';

export interface ISetupAppOptions {
  plugins?: PluginClass[];
}

export default function setupApp(
  config: IConfig,
  fn: ISetupFunction,
  setupOptions?: ISetupAppOptions,
): tinyapp.AppOptions {
  let options: tinyapp.AppOptions = {};

  type View = AppInstance<any, AppStore> & { $setup?: AppSetup };

  let view: View;

  @observable
  class BizAppStore extends AppStore {
    private stopWatchDeepList: (() => void)[] = [];

    public constructor() {
      super();
      // Mount store to the app instance.
      view.store = this;

      const setup = view.$setup!;
      setup.wrap(() => {
        this.stopWatchDeepList = integrateSetupFunctionResult<'app'>(fn, setup, view, this);
      });
    }

    public getPlugins() {
      if (!setupOptions || !setupOptions.plugins) {
        return super.getPlugins();
      }
      return setupOptions.plugins;
    }

    public async fetchInitData() {
      await super.fetchInitData();
      const fn = view.$setup!.getFetchInitDataMethod();
      fn && (await fn());
    }

    public destroy() {
      super.destroy();
      this.stopWatchDeepList.forEach(s => s());
      this.stopWatchDeepList = [];
    }
  }

  options = createApp(config, BizAppStore, options, {
    beforeCreateStore: (v: View) => {
      const setup = new AppSetup();
      v.$setup = setup;
      view = v;

      setup.iterateMethods((fns, name) => {
        appendFn(v, name, fns);
      });
    },
  });

  const lifeCycleMethods: ('onLaunch' | 'onShow' | 'onHide' | 'onError' | 'onShareAppMessage')[] = [
    'onLaunch',
    'onShow',
    'onHide',
    'onError',
    'onShareAppMessage',
  ];
  const lifeCycleMethodsOptions = integrateLifeCycleMethods<'app'>(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  return options;
}
