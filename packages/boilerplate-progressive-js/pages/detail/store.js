import { observable, computed } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  // Get currentShop from GlobalStore.
  // GlobalStore can not be used by PageView directly.
  currentShop = computed({
    get: () => {
      return this.globalStore.currentShop;
    }
  });
}

export default observable(MyPageStore);