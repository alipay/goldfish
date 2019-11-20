export interface IHttpRequestOptions extends Omit<my.IHttpRequestOptions, 'success' | 'fail' | 'complete'> {}

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
