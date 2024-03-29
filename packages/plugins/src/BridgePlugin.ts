import { bridge, BridgeMethods, SpecialMethods, Fn, APBridgeMethods } from '@goldfishjs/bridge';
import Plugin, { GetPlugin } from './Plugin';

export default class BridgePlugin extends Plugin {
  public static type = 'bridge';

  public async init(_: GetPlugin) {}

  public destroy() {}

  // my.xxx
  public async call<T extends keyof R, R extends Record<string, any> = BridgeMethods & SpecialMethods>(
    api: T,
    params?: Parameters<R[T]>[0],
  ) {
    return bridge.call(api, params);
  }

  // my.call('xxx')
  public async mycall<R, P = Record<string, any>>(
    api: string,
    params?: P extends Record<string, any> ? P : Record<string, any> | ((...args: any[]) => void),
  ) {
    return bridge.mycall(api, params);
  }

  // my.ap.xxx
  public async ap<T extends keyof R, R extends Record<string, Fn> = APBridgeMethods>(
    api: T,
    params?: Parameters<R[T]>[0],
  ) {
    return bridge.ap(api, params);
  }
}
