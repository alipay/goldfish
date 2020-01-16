import { setupPage, useState, useGlobalData } from '@goldfishjs/composition-api';

Page(
  setupPage(() => {
    const globalData = useGlobalData();

    const state = useState({
      get fullName() {
        return globalData.get('fullName');
      },
    });

    return {
      state,
      onChangeName() {
        globalData.set('fullName', 'Anther Name');
      },
    };
  })
);