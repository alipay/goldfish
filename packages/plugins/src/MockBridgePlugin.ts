import { GetPlugin } from './Plugin';
import {
  mockBridge as bridge,
  BridgeMethods,
  SpecialMethods,
  Fn,
  APBridgeMethods,
} from '@goldfishjs/bridge';
import ConfigPlugin, { IConfig } from './ConfigPlugin';
import BridgePlugin from './BridgePlugin';

export default class MockBridgePlugin extends BridgePlugin {
  private host?: string;

  public async init(getPlugin: GetPlugin) {
    const configPlugin = getPlugin(ConfigPlugin) as ConfigPlugin<IConfig>;
    this.host = configPlugin.get('bridgeMockServerHost');
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
    return this.host ? bridge.call(this.host, api, params) : super.call(api, params);
  }

  // my.call('xxx')
  public async mycall<R, P = Record<string, any>>(
    api: string,
    params?: P extends Record<string, any>
      ? P
      : Record<string, any> | ((...args: any[]) => void),
  ) {
    return this.host ? bridge.mycall(this.host, api, params) : super.mycall(api, params);
  }

  // my.ap.xxx
  public async ap<
    T extends keyof R,
    R extends Record<string, Fn> = APBridgeMethods
  >(
    api: T,
    params?: Parameters<R[T]>[0],
  ) {
    return this.host ? bridge.ap(this.host, api, params) : super.ap(api, params);
  }
}
