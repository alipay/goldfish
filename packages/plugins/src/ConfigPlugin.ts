import Plugin from './Plugin';

export interface IConfig {}

export default class ConfigPlugin extends Plugin {
  public static type = 'config';

  protected config?: IConfig;

  public setConfig(config: IConfig) {
    this.config = config;
  }

  public get<K extends keyof IConfig>(key: K) {
    return this.config![key];
  }

  public init() {}

  public destroy() {}
}
