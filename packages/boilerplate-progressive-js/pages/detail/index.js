import { createPage } from '@goldfishjs/core';
import store from './store';

Page(createPage(store, {
  onLoad() {},
  onHeart() {
    // You can not use:
    // `this.store.appStore.currentUser.heart = !this.store.appStore.currentUser.heart;`
    // hear, because `heart` props it is not define in currentUser in the beginning
    // there are not reactive link.

    this.store.appStore.currentUser = {
      ...this.store.appStore.currentUser,
      heart: !this.store.appStore.currentUser.heart,
    };
  },
}));
