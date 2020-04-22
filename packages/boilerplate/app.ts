import { setupApp, useState } from '@goldfishjs/composition-api';
import { IConfig } from '@goldfishjs/plugins';
import List from './store/List';

export interface IGlobalData {
  list: List;
}

const config: IConfig = {
};

App(setupApp(config, () => {
  const globalData = useState<IGlobalData>({
    list: new List(),
  });

  return globalData;
}));
