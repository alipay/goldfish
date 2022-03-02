import { PageInstance } from '@goldfishjs/reactive-connect';
import { observable } from '@goldfishjs/reactive';
import CommonSetup from './CommonSetup';

export type SetupPageInstance = PageInstance<any, any> & Pick<tinyapp.IPageOptionsMethods, 'onShareAppMessage'>;

export default class PageSetup extends CommonSetup<Required<tinyapp.IPageOptionsMethods>, SetupPageInstance> {
  public query: {
    data: tinyapp.Query | undefined;
  } = observable({ data: undefined });
}
