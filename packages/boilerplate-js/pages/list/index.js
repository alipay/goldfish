
import {
  setupPage,
  useGlobalData,
  usePageLifeCycle,
} from '@goldfishjs/composition-api';

// Observable page store to reactive
Page(setupPage(() => {
  // Get Global Data
  const globalData = useGlobalData();

  // Get List Store
  const list = globalData.get('list');

  usePageLifeCycle('onLoad', async () => {
    // Get list fetch when page onload
    await list.getList();
  });

  return {
    list,
    onItemClick(e) {
      const item = e.target.dataset.item;
      my.navigateTo({
        url: `/pages/detail/index?name=${item.name}`,
      });
    },
    async onScrollToLower() {
      console.log('onScrollToLower');

      // When scroll to page bottom, append data.
      await list.getList({ append: true });
    },
  }
}));
