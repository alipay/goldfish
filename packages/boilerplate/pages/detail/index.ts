import {
  setupPage,
  usePageLifeCycle,
  useGlobalData,
  useState,
} from '@goldfishjs/composition-api';
import { IGlobalData } from '../../app';
import { IListItem } from '../../common/request';

export interface IDetailState {
  name: string;
  current: IListItem | undefined;
  currentHeart: boolean | undefined;
}

Page(setupPage(() => {
  const globalData = useGlobalData<IGlobalData>();
  const listStore = globalData.get('list');

  const state = useState<IDetailState>({
    name: '',
    get current() {
      return listStore.list.find(item => item.name === this.name);
    },
    get currentHeart() {
      return this.current?.heart;
    },
  });

  usePageLifeCycle('onLoad', query => {
    state.name = query.name as string;
  });

  return {
    state,
    list: listStore.list,
    onHeart() {
      listStore.toggleHeart(state.name);
    },
  }
}));
