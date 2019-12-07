import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import AppSetup from './setup/AppSetup';
import { AppStore, createApp  } from '@goldfishjs/core';
import { IConfig, PluginClass } from '@goldfishjs/plugins';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import { AppInstance, observable } from '@goldfishjs/reactive-connect';
import appendFn from './appendFn';

export interface ISetupAppOptions {
  plugins?: PluginClass[];
}

export default function setupApp(
  config: IConfig,
  fn: ISetupFunction,
  setupOptions?: ISetupAppOptions,
): tinyapp.AppOptions {
  const options = integrateLifeCycleMethods<'app'>([
    'onLaunch',
    'onShow',
    'onHide',
    'onError',
    'onShareAppMessage',
  ]);

  type View = AppInstance<any, AppStore> & { $setup?: AppSetup };

  let view: View;

  @observable
  class BizAppStore extends AppStore {
    public constructor() {
      super();
      // Mount store to the app instance.
      view.store = this;

      const setup = view.$setup!;
      setup.wrap(() => {
        integrateSetupFunctionResult<'app'>(fn, setup, view, this);
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
      fn && await fn();
    }
  }

  createApp(
    config,
    BizAppStore,
    options,
    {
      beforeCreateStore: (v: View) => {
        const setup = new AppSetup();
        v.$setup = setup;
        view = v;

        setup.iterateMethods((fns, name) => {
          appendFn(v, name, fns);
        });
      },
    },
  );

  return options;
}
