
import { createPage } from '@goldfishjs/core';
import store from './store';

// Observable page store to reactive
Page(createPage(store, {
  onShow() {
    console.log('on show');
  },
  onReady() {
    console.log('on ready');
  },
  async onLoad() {
    // Watching this.store.loading
    // When this.store.loading change, show loading toast.
    this.store.watch(
      () => this.store.loading,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (newValue) {
            my.showToast({
              content: 'loading...',
            });
          } else {
            my.hideLoading();
          }
        }
    });

    // Get data when page onload
    await this.store.getList();
  },
  onUnload() {
    console.log('on unload');
  },
  onHide() {
    console.log('on hide');
  },
  onItemClick(e) {
    try {
      // Get item data from event
      const item = e.target.dataset.item;
      this.store.appStore.currentShop = {...item};
    } catch(e) {
      throw new Error('no shop item');
    }

    // Navigate to next page
    my.navigateTo({
      url: '/pages/detail/index',
    });
  },
  async onScrollToLower() {
    console.log('onScrollToLower');

    // When scroll to page bottom, append data.
    await this.store.getList({ append: true });
  },
}));
