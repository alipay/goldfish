import { createPage, PageStore as BasePageStore } from '@alipay/goldfish';
import { AppStore } from '../../app';

class PageStore extends BasePageStore<AppStore> {

}

Page(createPage(PageStore, {}));
