import { createPage } from '@goldfishjs/core';
import store from './store';

Page(createPage(store, {
  onLoad() {},
  onSubmit(e) {
    this.store.formData = e.detail.value;
  },
  onOpenSelectDate() {
    this.store.showDate = true;
  },
  onCloseSelectDate() {
    this.store.showDate = false;
  },
  handleSelect(date) {
    this.store.showDate = false;
    this.store.date = date[0];
  },
}));
