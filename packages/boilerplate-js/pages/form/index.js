import { setupPage } from '@goldfishjs/composition-api';

Page(setupPage(() => {
  return {
    onSubmit(e) {
      // Get Form Data from `e.detail.value`;
      const value = e.detail.value;
      if (!value.name || !value.description) {
        my.alert({
          content: 'Please Fill in the Form.',
        });

        return;
      }

      my.confirm({
        title: 'Your Submit Data',
        // Using the format output.
        content: value,
      });
    },
  }
}));
