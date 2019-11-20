import { createPage, AppStore, PageStore } from '@goldfishjs/core';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import { observable, PageInstance } from '@goldfishjs/reactive-connect';
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

export default function setupPage<D, AS extends AppStore>(
  fn: ISetupFunction,
) {
  type View = PageInstance<D, BizPageStore> & { $setup?: PageSetup };
  let view: View;

  @observable
  class BizPageStore extends PageStore<AS> {
    public constructor() {
      super();
      const setup = view.$setup!;
      setup.wrap(() => {
        integrateSetupFunctionResult<'page'>(fn, setup, view, this);
      });
    }

    public async fetchInitData() {
      await super.fetchInitData();
      const fn = view.$setup!.getFetchInitDataMethod();
      fn && await fn();
    }
  }

  const options = integrateLifeCycleMethods<'page'>(lifeCycleMethods);

  return createPage<AS, BizPageStore, D>(
    BizPageStore,
    options,
    {
      beforeCreateStore: (v: View) => {
        const setup = new PageSetup();
        v.$setup = setup;
        view = v;

        setup.iterateMethods((fns, name) => {
          appendFn(v, name, fns);
        });
      },
    },
  );
}
