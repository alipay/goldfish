import {
  setupPage,
  useState,
} from '@goldfishjs/composition-api';

Page(
  setupPage(() => {
    const state = useState({
      count: 1,
    });

    return {
      state,
      onAdd() {
        state.count += 1;
      },
    }
  })
);
