import { setupApp } from '@alipay/goldfish-composition-api';
import { IConfig } from '@alipay/goldfish-plugins';

const config: IConfig = {};

App(setupApp(config, () => {
  return {};
}));
