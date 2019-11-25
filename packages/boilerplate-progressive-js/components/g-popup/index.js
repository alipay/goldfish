import { createComponent } from '@goldfishjs/core';
import store from './store';

Component(createComponent(store, {
  didMount() {},
  methods: {
    onPopupClose(event) {
      this.store.closeCount++;
      if (this.props.onClose) {
        this.props.onClose(event);
      }
    },
  }
}));

