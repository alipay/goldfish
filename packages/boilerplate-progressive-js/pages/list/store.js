import { observable, state } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';
import request from '../../common/request';

class MyPageStore extends PageStore {
  // State statement means this properties need to be observable.
  loading = state(false);
  showDialog = state(true);
  list = state([]);
  isEmpty = state(false);

  // Any compute operation of data, need integrate to store.
  async getList(config = {}) {
    this.loading = true;
    const data = await request({
      url: '/api/list'
    }) || [];

    if (config.append) {
      this.list.push(...data);
    } else {
      this.list = [...data];
    }

    this.isEmpty = this.list.length < 1;
    this.loading = false;
  }
}

// MyPageStore need observable
export default observable(MyPageStore);