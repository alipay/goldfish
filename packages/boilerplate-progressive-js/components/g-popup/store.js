import { observable, state } from '@goldfishjs/reactive-connect';
import { ComponentStore } from '@goldfishjs/core';

class MyComponentStore extends ComponentStore {
  props = state({});
  closeCount = state(0);
}

export default observable(MyComponentStore);
