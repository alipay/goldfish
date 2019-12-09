import { observable, state } from '@goldfishjs/reactive-connect';
import { AppStore } from '@goldfishjs/core';

class MyAppStore extends AppStore {
  currentUser = state({});
}

export default observable(MyAppStore);
