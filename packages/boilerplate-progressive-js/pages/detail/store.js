import { observable, computed, state } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  // Get currentUser from AppStore.
  // AppStore can not be used by PageView directly.
  test = state(true);

  currentUser = computed(() => this.appStore.currentUser);
}

export default observable(MyPageStore);