import { observable, state, computed } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  showDate = state(false);
  date = state('');
  formData = state({});
  formatFormData = computed(() => JSON.stringify(this.formData, null, 2));
}

export default observable(MyPageStore);
