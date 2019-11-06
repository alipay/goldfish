import { PageStore as BasePageStore } from '@alipay/goldfish-reactive-connect';
import AppStore from './AppStore';

export default class PageStore<GS extends AppStore> extends BasePageStore<GS> {
}
