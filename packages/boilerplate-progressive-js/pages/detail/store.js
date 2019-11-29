import { observable, computed } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  // Get currentShop from AppStore.
  // AppStore can not be used by PageView directly.
  currentShop = computed({
    get: () => {
      return this.appStore.currentShop;
    }
  });
}

export default observable(MyPageStore);