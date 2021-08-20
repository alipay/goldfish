import { AppStore } from '@goldfishjs/core';
import { AppInstance } from '@goldfishjs/reactive-connect';
import CommonSetup from './CommonSetup';

export type SetupAppStore = AppStore;

export type SetupAppInstance = AppInstance<any, AppStore>;

export default class AppSetup extends CommonSetup<
  Required<tinyapp.IAppOptionsMethods>,
  SetupAppStore,
  SetupAppInstance
> {}
