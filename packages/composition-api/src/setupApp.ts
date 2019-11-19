import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import AppSetup from './setup/AppSetup';
import { AppStore, createApp  } from '@goldfishjs/goldfish';
import { IConfig, PluginClass } from '@goldfishjs/goldfish-plugins';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import { attachLogic, AppInstance, observable } from '@goldfishjs/goldfish-reactive-connect';
import appendFn from './appendFn';

interface IAppInstance extends tinyapp.IAppInstance<any> {
  $setup: AppSetup;
  stopWatchFeedback: () => void;
}

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

  attachLogic<'onLaunch', Required<tinyapp.AppOptions>['onLaunch']>(
    options,
    'onLaunch',
    'before',
    async function (this: AppInstance<any, AppStore>) {
      const store = this.store!;
      await store.waitForReady();
      // TODO: Feedback
    },
  );

  type View = AppInstance<any, AppStore> & { $setup?: AppSetup };

  let view: View;

  @observable
  class BizAppStore extends AppStore {
    public constructor() {
      super();
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
