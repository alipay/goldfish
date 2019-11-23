import { observable, state, computed } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  formData = state({});
  formatFormData = computed({
    get: () => {
      return JSON.stringify(this.formData, null, 2);
    }
  });
}

export default observable(MyPageStore);
