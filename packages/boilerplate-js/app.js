import { setupApp, useState } from '@goldfishjs/composition-api';
import List from './store/list';

App(setupApp({}, () => {
  const globalData = useState({
    list: new List(),
  });

  return globalData;
}));
