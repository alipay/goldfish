/* eslint-disable @typescript-eslint/no-empty-interface */
export interface IHttpRequestOptions extends Omit<my.IHttpRequestOptions, 'success' | 'fail' | 'complete'> {}
/* eslint-enable @typescript-eslint/no-empty-interface */

export default function httpRequest<R>(options: IHttpRequestOptions): Promise<R> {
  return new Promise((resolve, reject) => {
    (my.request || my.httpRequest).call(my, {
      ...options,
      fail: reject,
      success: (res: any) => {
        resolve(res ? res.data : {});
      },
    });
  });
}
