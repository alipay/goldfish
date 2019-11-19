import { setupApp } from '@goldfishjs/goldfish-composition-api';
import { IConfig } from '@goldfishjs/goldfish-plugins';

const config: IConfig = {};

App(setupApp(config, () => {
  return {};
}));
