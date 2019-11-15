import Plugin from './Plugin';

export interface IConfig {
  mockServerHost?: string;
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
