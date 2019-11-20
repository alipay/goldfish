import { setupApp } from '@goldfishjs/composition-api';
import { IConfig } from '@goldfishjs/plugins';

const config: IConfig = {
};

App(setupApp(config, () => {
  return {
    globalName: '1111',
  };
}));
