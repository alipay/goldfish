import { createPage, AppStore, PageStore } from '@goldfishjs/core';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import { observable, PageInstance, attachLogic } from '@goldfishjs/reactive-connect';
import PageSetup from './setup/PageSetup';
import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import appendFn from './appendFn';

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
  'onShareAppMessage',
  'onPageScroll',
];

export default function setupPage<D, AS extends AppStore>(fn: ISetupFunction) {
  type View = PageInstance<D, BizPageStore> & { $setup?: PageSetup };
  let view: View;

  @observable
  class BizPageStore extends PageStore<AS> {
    private stopWatchDeepList: (() => void)[] = [];

    public constructor() {
      super();
      const setup = view.$setup!;
      setup.wrap(() => {
        this.stopWatchDeepList = integrateSetupFunctionResult<'page'>(fn, setup, view, this);
      });
    }

    public async fetchInitData() {
      await super.fetchInitData();
      const fn = view.$setup!.getFetchInitDataMethod();
      fn && (await fn());
    }

    public destroy() {
      super.destroy();
      this.stopWatchDeepList.forEach(stop => stop());
      this.stopWatchDeepList = [];
    }
  }

  let options: tinyapp.PageOptions<D> = {};

  options = createPage<AS, BizPageStore, D>(BizPageStore, options, {
    beforeCreateStore: (v: View) => {
      const setup = new PageSetup();
      v.$setup = setup;
      view = v;

      setup.iterateMethods((fns, name) => {
        appendFn(v, name, fns);
      });
    },
  });

  const lifeCycleMethodsOptions = integrateLifeCycleMethods<'page'>(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });
  return options;
}
