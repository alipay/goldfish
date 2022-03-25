import { AppInstance, attachLogic } from '@goldfishjs/reactive-connect';
import { get as keyPathGet } from '@goldfishjs/reactive-connect/lib/MiniDataSetter/keyPath';
import { cloneDeep, uniqueId } from '@goldfishjs/utils';
import AppSetup from './setup/AppSetup';
import { ISetupFunction } from './setup/CommonSetup';
import appendFn from './appendFn';
import setupManager from './setup/setupManager';

const lifeCycleMethods: (keyof tinyapp.IAppOptionsMethods)[] = [
  'onLaunch',
  'onShow',
  'onHide',
  'onError',
  'onUnhandledRejection',
];

export const APP_SETUP_ID_KEY = '$$appSetupId';

export default function setupApp(fn: ISetupFunction): tinyapp.AppOptions {
  let options: tinyapp.AppOptions = {};

  type View = AppInstance<any, any>;

  let finalData: Record<string, any> = {};

  // Create the setup instance.
  const setup = new AppSetup();
  const appSetupId = uniqueId('app-setup-');
  finalData[APP_SETUP_ID_KEY] = appSetupId;
  setupManager.add(appSetupId, setup);

  // Execute the setup function.
  setup.executeSetupFunction(fn);

  // Set the global data.
  const compositionData = setup.compositionState;
  if (compositionData) {
    finalData =
      typeof finalData === 'object' ? { ...finalData, ...cloneDeep(compositionData) } : cloneDeep(compositionData);
  }
  options.globalData = finalData;

  attachLogic(options, 'onLaunch', 'before', function (this: View, options: tinyapp.IAppLaunchOptions) {
    setup.status = 'ready';

    // Save the launch options.
    setup.launchOptions = options;

    // Set the app instance.
    setup.setViewInstance(this);

    // Mount the instance methods.
    setup.iterateInstanceMethods((fns, name) => {
      appendFn(this, name, fns as Function[]);
    });

    // Watch the reactive data.
    (this as any).$batchedUpdates = (cb: Function) => cb();
    (this as any).setData = (obj: Record<string, any>) => {
      for (const key in obj) {
        const keyPathList = keyPathGet(key);
        keyPathList.reduce((prevData, keySeg, index, list) => {
          if (index === list.length - 1) {
            prevData[keySeg] = obj[key];
          }
          return prevData[keySeg];
        }, this.globalData);
      }
    };
    (this as any).$spliceData = (obj: Record<string, [number, number, ...any[]]>) => {
      for (const key in obj) {
        const keyPathList = keyPathGet(key);
        keyPathList.reduce((prevData, keySeg, index, list) => {
          if (index === list.length - 1) {
            prevData[keySeg].splice(obj[key][0], obj[key][1], ...obj[key].slice(2));
          }
          return prevData[keySeg];
        }, this.globalData);
      }
    };
    setup.watchReactiveData();

    // Init loading
    const initFn = setup.getFetchInitDataMethod();
    const initCompleteHandler = () => {
      setup.compositionState.isInitLoading = false;
    };
    Promise.resolve(initFn && initFn()).then(initCompleteHandler, initCompleteHandler);
  });

  // Mount the lifecycle methods.
  function integrateLifeCycleMethods(lifeCycleMethods: (keyof tinyapp.IAppOptionsMethods)[]) {
    return lifeCycleMethods.reduce<tinyapp.AppOptions<any>>((prev, cur) => {
      (prev as any)[cur] = function (...args: any[]) {
        return setup.executeLifeCycleFns(cur, ...args);
      };
      return prev;
    }, {});
  }
  const lifeCycleMethodsOptions = integrateLifeCycleMethods(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  return options;
}
