import { AppStore } from '@goldfishjs/core';
import { AppInstance } from '@goldfishjs/reactive-connect';
import CommonSetup from './CommonSetup';

export type SetupAppStore = AppStore;

export type SetupAppInstance = AppInstance<any, AppStore> & Pick<tinyapp.IAppOptionsMethods, 'onShareAppMessage'>;

export default class AppSetup extends CommonSetup<
  Required<tinyapp.IAppOptionsMethods>,
  SetupAppStore,
  SetupAppInstance
> {
  public launchOptions?: tinyapp.IAppLaunchOptions;

  public addMethod<N extends keyof Required<tinyapp.IAppOptionsMethods>>(
    name: N,
    fn: Required<tinyapp.IAppOptionsMethods>[N],
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
