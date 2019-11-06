// my.xxx type bridge
export type BridgeType = Pick<typeof my, 'getAuthCode' | 'request'>;

// my.ap.xxx type bridge
export type APBridgeType = typeof my.ap;

type PickSuccessResult<T> = T extends {
  success?: (r: infer R) => any | void;
  fail?: (r?: any) => any | void;
} ? R : any;

export default {
  // my.xxx
  call: async function call<T extends keyof R, R extends Record<string, any> = BridgeType>(
    api: T,
    params?: Parameters<R[T]>[0],
  ): Promise<PickSuccessResult<Parameters<R[T]>[0]>> {
    return new Promise((resolve, reject) => {
      if (typeof (my as any)[api] === 'function' && params) {
        (my as any)[api]({
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

  // my.call('xxx')
  mycall: async function mycall<T, R = Record<string, any>>(
    api: string,
    params?: R extends Record<string, any> ? R : Record<string, any> | ((...args: any[]) => void),
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      my.call(
        api,
        params,
        (result: T) => {
          resolve(result);
        },
      );
    });
  },

  // my.ap.xxx
  ap: async function call<T extends keyof R, R extends Record<string, any> = APBridgeType>(
    api: T,
    params?: Parameters<R[T]>[0],
  ): Promise<PickSuccessResult<Parameters<R[T]>[0]>> {
    return new Promise((resolve, reject) => {
      if (typeof (my as any)[api] === 'function' && params) {
        (my as any)[api]({
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
