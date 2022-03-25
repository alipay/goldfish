import { PageInstance, attachLogic } from '@goldfishjs/reactive-connect';
import { cloneDeep, uniqueId } from '@goldfishjs/utils';
import { ISetupFunction } from './setup/CommonSetup';
import PageSetup from './setup/PageSetup';
import appendFn from './appendFn';
import setupManager from './setup/setupManager';

const lifeCycleMethods: (keyof tinyapp.IPageOptionsMethods)[] = [
  'onPullDownRefresh',
  'onTitleClick',
  'onOptionMenuClick',
  'onPopMenuClick',
  'onPullIntercept',
  'onTabItemTap',
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload',
  'onReachBottom',
  'onPageScroll',
];

const pageEventMethods: (keyof tinyapp.IPageEvents)[] = [
  'onBack',
  'onKeyboardHeight',
  'onOptionMenuClick',
  'onPopMenuClick',
  'onPullIntercept',
  'onPullDownRefresh',
  'onTitleClick',
  'onTabItemTap',
  'beforeTabItemTap',
];

export const PAGE_SETUP_ID_KEY = '$$pageSetupId';

function integratePageEventMethods(pageMethods: (keyof tinyapp.IPageEvents)[]): tinyapp.IPageEvents {
  return pageMethods.reduce((prev, cur: keyof tinyapp.IPageEvents) => {
    (prev as any)[cur] = function (this: any, ...args: any[]) {
      const setup = setupManager.get((this.data as any)?.[PAGE_SETUP_ID_KEY]);
      if (!setup) {
        return;
      }

      const fns: Function[] = (setup.getMethod as any)(`events.${cur}`) || [];
      let result: any;
      for (const i in fns) {
        const fn = fns[i];
        result = (fn as Function).call(this, ...args);
      }
      return result;
    };
    return prev;
  }, {});
}

export default function setupPage<D>(fn: ISetupFunction): tinyapp.PageOptions<D> {
  type View = PageInstance<D, any>;

  let options: tinyapp.PageOptions<D> = {};

  const oldData = options.data;
  options.data = function (this: View) {
    let finalData: Record<string, any> = {};
    if (oldData) {
      finalData = typeof oldData === 'function' ? oldData.call(this) : oldData;
    }

    // Create the setup instance.
    const pageSetupId = uniqueId('page-setup-');
    finalData[PAGE_SETUP_ID_KEY] = pageSetupId;
    const setup = new PageSetup();
    setupManager.add(pageSetupId, setup);

    // Execute the setup function.
    setup.executeSetupFunction(fn);

    const compositionData = setup.compositionState;
    if (compositionData) {
      finalData =
        typeof finalData === 'object' ? { ...finalData, ...cloneDeep(compositionData) } : cloneDeep(compositionData);
    }

    // Set the component instance.
    setup.setViewInstance(this);

    // Mount the instance methods.
    setup.iterateInstanceMethods((fns, name) => {
      appendFn(this, name, fns as Function[]);
    });

    // Watch the reactive data.
    setup.watchReactiveData();

    // Init loading
    const initFn = setup.getFetchInitDataMethod();
    const initCompleteHandler = () => {
      setup.compositionState.isInitLoading = false;
    };
    Promise.resolve(initFn && initFn()).then(initCompleteHandler, initCompleteHandler);

    return finalData;
  } as any;

  attachLogic(options, 'onLoad', 'before', function (this: View, query: tinyapp.Query) {
    const setup = setupManager.get((this.data as any)?.[PAGE_SETUP_ID_KEY]) as PageSetup | undefined;
    if (!setup) {
      return;
    }

    setup.status = 'ready';
    setup.query.data = query;
  });

  // Mount the lifecycle methods.
  function integrateLifeCycleMethods(lifeCycleMethods: (keyof tinyapp.IPageOptionsMethods)[]) {
    return lifeCycleMethods.reduce<tinyapp.PageOptions<any>>((prev, cur) => {
      (prev as any)[cur] = function (this: View, ...args: any[]) {
        const setup = setupManager.get((this.data as any)?.[PAGE_SETUP_ID_KEY]);
        if (!setup) {
          return;
        }

        return setup.executeLifeCycleFns(cur, ...args);
      };
      return prev;
    }, {});
  }
  const lifeCycleMethodsOptions = integrateLifeCycleMethods(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  // Mount the page event methods.
  const pageEventMethodsOptions = integratePageEventMethods(pageEventMethods);
  pageEventMethods.forEach(m => {
    options.events = options.events || {};
    attachLogic(options.events, m, 'after', pageEventMethodsOptions[m] as any);
  });

  // Destroy
  attachLogic(options, 'onUnload', 'after', function (this: View) {
    const setup = setupManager.get((this.data as any)?.[PAGE_SETUP_ID_KEY]);
    setup?.destroy();
  });

  return options;
}
