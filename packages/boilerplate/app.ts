import { createApp, AppStore as BaseAppStore } from '@alipay/goldfish';

export class AppStore extends BaseAppStore {

}

App(createApp({}, AppStore, {}));
