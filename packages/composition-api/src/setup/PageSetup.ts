import { PageStore } from '@goldfishjs/core';
import { PageInstance } from '@goldfishjs/reactive-connect';
import CommonSetup from './CommonSetup';

export type SetupPageStore = PageStore;

export type SetupPageInstance = PageInstance<any, PageStore>;

export default class PageSetup extends CommonSetup<
  Required<tinyapp.IPageOptionsMethods>,
  SetupPageStore,
  SetupPageInstance
> {}
