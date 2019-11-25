import { observable, state } from '@goldfishjs/reactive-connect';
import { ComponentStore } from '@goldfishjs/core';

class MyComponentStore extends ComponentStore {
  test = state({});
  props = state({});
}

export default observable(MyComponentStore);
