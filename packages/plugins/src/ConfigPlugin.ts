import Plugin from './Plugin';
import { IDatahubConfig, IRequestOptions } from '@alipay/goldfish-requester';

export interface IConfig {
  mockServerHost?: string;
  requesterOptions?: Pick<IRequestOptions, 'showLoading' | 'delay' | 'method' | 'dataType'>;
  datahubConfig?: IDatahubConfig;
}

export default class ConfigPlugin<C extends IConfig = IConfig> extends Plugin {
  public static type = 'config';

  protected config?: C;

  public setConfig(config: C) {
    this.config = config;
  }

  public get<K extends keyof C>(key: K) {
    return this.config![key];
  }

  public init() {}

  public destroy() {}
}
