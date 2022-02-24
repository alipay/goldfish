import { PageInstance } from '@goldfishjs/reactive-connect';
import CommonSetup from './CommonSetup';
import PageStore from '../connector/store/PageStore';

export type SetupPageStore = PageStore;

export type SetupPageInstance = PageInstance<any, PageStore> & Pick<tinyapp.IPageOptionsMethods, 'onShareAppMessage'>;

export default class PageSetup extends CommonSetup<
  Required<tinyapp.IPageOptionsMethods>,
  SetupPageStore,
  SetupPageInstance
> {
  public query?: tinyapp.Query;

  public addMethod<N extends keyof Required<tinyapp.IPageOptionsMethods>>(
    name: N,
    fn: Required<tinyapp.IPageOptionsMethods>[N],
  ) {
    if (name === 'onShareAppMessage') {
      const view = this.getViewInstance();
      if (view) {
        const oldOnShareAppMessage = view.onShareAppMessage;
        view.onShareAppMessage = (options: Parameters<Required<typeof view>['onShareAppMessage']>[0]) => {
          const previousResult = oldOnShareAppMessage?.call(view, options);
          return {
            ...previousResult,
            ...(fn as any).call(view, options),
          };
        };
        return;
      }
    }
    return super.addMethod(name, fn);
  }
}
