import { IDatahubConfig, IRequestOptions } from '@goldfishjs/requester';
import Plugin from './Plugin';

export interface IConfig {
  bridgeMockServerHost?: string;
  requesterOptions?: Pick<IRequestOptions, 'showLoading' | 'delay' | 'method' | 'dataType'>;
  datahubConfig?: IDatahubConfig;
}

export default class ConfigPlugin<C extends IConfig = IConfig> extends Plugin {
  public static type = 'config';

  protected config?: C;

  public setConfig(config: C) {
    this.config = config;
  }

  public get<K extends keyof C>(key: K): C[K] {
    if (!this.config) {
      throw new Error('The ConfigPlugin is not ready.');
    }
    return this.config[key];
  }

  public async init() {}

  public destroy() {}
}
