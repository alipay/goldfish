import { AppInstance, observable, attachLogic } from '@goldfishjs/reactive-connect';
import AppStore from './connector/store/AppStore';
import createApp from './connector/view/createApp';
import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import AppSetup from './setup/AppSetup';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import appendFn from './appendFn';

export default function setupApp(fn: ISetupFunction): tinyapp.AppOptions {
  let options: tinyapp.AppOptions = {};

  type View = AppInstance<any, AppStore> & { $setup?: AppSetup; $launchOptions?: tinyapp.IAppLaunchOptions };

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

  options = createApp(BizAppStore, options, {
    beforeCreateStore: (v: View) => {
      const setup = new AppSetup();
      v.$setup = setup;
      view = v;

      setup.launchOptions = v.$launchOptions;

      setup.iterateMethods((fns, name) => {
        appendFn(v, name, fns);
      });
    },
  });

  attachLogic(options, 'onLaunch', 'before', function (this: View, options: tinyapp.IAppLaunchOptions) {
    this.$launchOptions = options;
  });

  const lifeCycleMethods: ('onLaunch' | 'onShow' | 'onHide' | 'onError')[] = [
    'onLaunch',
    'onShow',
    'onHide',
    'onError',
  ];
  const lifeCycleMethodsOptions = integrateLifeCycleMethods<'app'>(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  return options;
}
