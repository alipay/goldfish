// my.xxx type bridge
export type BridgeMethods = Omit<
  typeof my,
  | 'call'
  | 'ap'
  | 'reportCustomError'
  | 'reportAnalytics'
  | 'getRunScene'
  | 'SDKVersion'
>;

// my.ap.xxx type bridge
export type APBridgeMethods = typeof my.ap;

type PickSuccessResult<T> = T extends {
  success?: (r: infer R) => any | void;
  fail?: (r?: any) => any | void;
}
  ? R
  : never;

type Fn = (params: any, ...args: any[]) => any | void;

type SpecialMethods = {
  reportCustomError: (error: Error) => void;
  reportAnalytics: (eventName: string, data: Record<string, any>) => void;
  getRunScene: (res: my.IGetRunSceneOptions) => void;
};

export default {
  // my.xxx
  call: async function call<
    T extends keyof R,
    R extends Record<string, any> = BridgeMethods & SpecialMethods,
  >(
    api: T,
    params?: Parameters<R[T]>[0],
  ): Promise<PickSuccessResult<Parameters<R[T]>[0]>> {
    return new Promise((resolve, reject) => {
      if (
        typeof (my as R extends BridgeMethods ? R : any)[api] === 'function') {
        (my as R extends BridgeMethods ? R : any)[api]({
          ...params,
          success(res: PickSuccessResult<Parameters<R[T]>[0]>) {
            resolve(res);
          },
          fail: reject,
        });
      }
    });
  },

  // my.call('xxx')
  mycall: async function mycall<R, P = Record<string, any>>(
    api: string,
    params?: P extends Record<string, any>
      ? P
      : Record<string, any> | ((...args: any[]) => void),
  ): Promise<R> {
    return new Promise((resolve) => {
      my.call(api, params, (result: R) => {
        resolve(result);
      });
    });
  },

  // my.ap.xxx
  ap: async function call<
    T extends keyof R,
    R extends Record<string, Fn> = APBridgeMethods
  >(
    api: T,
    params?: Parameters<R[T]>[0],
  ): Promise<PickSuccessResult<Parameters<R[T]>[0]>> {
    return new Promise((resolve, reject) => {
      if (
        typeof (my as R extends APBridgeMethods ? R : any)[api] ===
          'function' &&
        params
      ) {
        (my as R extends APBridgeMethods ? R : any)[api]({
          ...params,
          success(res: PickSuccessResult<Parameters<R[T]>[0]>) {
            resolve(res);
          },
          fail() {
            reject();
          },
        });
      }
    });
  },
};
