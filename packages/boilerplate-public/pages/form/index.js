import { createPage } from '@goldfishjs/core';
import store from './store';

Page(createPage(store, {
  onLoad() {},
  onSubmit(e) {
    this.store.formData = e.detail.value;
  },
}));
