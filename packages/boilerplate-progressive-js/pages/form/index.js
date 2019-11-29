import { createPage } from '@goldfishjs/core';
import store from './store';

Page(createPage(store, {
  onLoad() {},
  onSubmit(e) {
    // Get Form Data from `e.detail.value`;
    const value = e.detail.value;
    if (!value.name || !value.description) {
      my.alert({
        content: 'Please Fill in the Form.',
      });

      return;
    }

    this.store.formData = value;

    my.confirm({
      title: 'Your Submit Data',
      // Using the format output.
      content: this.store.formatFormData,
    });
  },
}));
