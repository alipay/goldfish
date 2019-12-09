import {
  setupPage,
  usePageLifeCycle,
  useGlobalData,
  useState,
} from '@goldfishjs/composition-api';

Page(setupPage(() => {
  const globalData = useGlobalData();
  const listStore = globalData.get('list');

  const state = useState({
    name: '',
    get current() {
      return listStore.list.find(item => item.name === this.name);
    },
  });

  usePageLifeCycle('onLoad', query => {
    state.name = query.name;
  });

  return {
    list: listStore.list,
    state,
    onHeart() {
      listStore.toggleHeart(state.name);
    },
  }
}));
