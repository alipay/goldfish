import {
  BridgeMethods,
  SpecialMethods,
  APBridgeMethods,
  PickSuccessResult,
  Fn,
} from './index';

function mockServer<T>(host: string, api: string, params?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    my.request({
      url: `${host}/jsapi/${api}`,
      method: 'GET',
      data: {
        ...params,
      },
      success(result: T) {
        resolve(result);
      },
      fail: reject,
    });
  });
}

export default {
  // my.xxx
  call: async function call<
    T extends keyof R,
    R extends Record<string, any> = BridgeMethods & SpecialMethods
  >(
    host: string,
    api: T,
    params?: Parameters<R[T]>[0],
  ): Promise<PickSuccessResult<Parameters<R[T]>[0]>> {
    return mockServer<PickSuccessResult<Parameters<R[T]>[0]>>(host, api as string, params);
  },

  // my.call('xxx')
  mycall: async function mycall<R, P = Record<string, any>>(
    host: string,
    api: string,
    params?: P extends Record<string, any>
      ? P
      : Record<string, any> | ((...args: any[]) => void),
  ): Promise<R> {
    return mockServer<R>(host, api as string, params);
  },

  // my.ap.xxx
  ap: async function ap<
    T extends keyof R,
    R extends Record<string, Fn> = APBridgeMethods
  >(
    host: string,
    api: T,
    params?: Parameters<R[T]>[0],
  ): Promise<PickSuccessResult<Parameters<R[T]>[0]>> {
    return mockServer<PickSuccessResult<Parameters<R[T]>[0]>>(host, api as string, params);
  },
};
