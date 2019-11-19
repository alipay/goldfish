import Plugin, { GetPlugin } from './Plugin';
import {
  mockBridge as bridge,
  BridgeMethods,
  SpecialMethods,
  Fn,
  APBridgeMethods,
} from '@goldfishjs/bridge';
import ConfigPlugin, { IConfig } from './ConfigPlugin';

export default class MockBridgePlugin extends Plugin {
  public static type = 'bridge';

  private host?: string;

  private get normalizedHost() {
    if (!this.host) {
      throw new Error('No host config.');
    }

    return this.host;
  }

  public init(getPlugin: GetPlugin) {
    const configPlugin = getPlugin(ConfigPlugin) as ConfigPlugin<IConfig>;
    this.host = configPlugin.get('mockServerHost');
  }

  public destroy() {}

  // my.xxx
  public async call<
    T extends keyof R,
    R extends Record<string, any> = BridgeMethods & SpecialMethods,
  >(
    api: T,
    params?: Parameters<R[T]>[0],
  ) {
    return bridge.call(this.normalizedHost, api, params);
  }

  // my.call('xxx')
  public async mycall<R, P = Record<string, any>>(
    api: string,
    params?: P extends Record<string, any>
      ? P
      : Record<string, any> | ((...args: any[]) => void),
  ) {
    return bridge.mycall(this.normalizedHost, api, params);
  }

  // my.ap.xxx
  public async ap<
    T extends keyof R,
    R extends Record<string, Fn> = APBridgeMethods
  >(
    api: T,
    params?: Parameters<R[T]>[0],
  ) {
    return bridge.ap(this.normalizedHost, api, params);
  }
}
