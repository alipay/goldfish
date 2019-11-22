import { createPage } from '@goldfishjs/core';
import store from './store';

Page(createPage(store, {
  onLoad() {},
}));
