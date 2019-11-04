// eslint-disable-next-line @typescript-eslint/no-namespace
export type IfNull<M, Key extends keyof M> = M extends (undefined | null)
  ? InOutParamTypes
  : (M[Key] extends (undefined | null) ? InOutParamTypes : M[Key]);

type InOutParamTypes = {
  out?: any;
  in?: Record<string, any>;
};

export type IfNoInOut<M, Key extends 'in' | 'out'> = Key extends keyof M
  ? M[Key]
  : undefined;

type DataTypeResultMap = {
  JSON: Record<string, any>;
  text: string;
  base64: string;
};

type StatusMessageMap = {
  11: '无权跨域';
  12: '网络出错';
  13: '超时';
  14: '解码失败';
  19: 'HTTP错误';
  20: '请求已被停止/服务端限流';
};

type StatusCodes = keyof StatusMessageMap;

export type PromiseCreator<T = any> = (...args: any[]) => Promise<T>;

export type withForceUpdate<T> = T & {
  forceRefresh: T;
};

export type Request<M> = <
  Url extends keyof M,
  ParamType extends IfNull<M, Url>,
  ReturnType extends ResultData<IfNoInOut<ParamType, 'out'>>
>(
  url: Url,
  param?: IfNoInOut<ParamType, 'in'>,
  overrideOptions?: RequestOptions,
) => Promise<ReturnType>;

export type ResultData<T> = {
  data: T extends (null | undefined)
    ? DataTypeResultMap[keyof DataTypeResultMap]
    : T;
  /**
   * Response code
   * - 11：无权跨域
   * - 12：网络出错
   * - 13：超时
   * - 14：解码失败
   * - 19：HTTP错误
   * - 20：请求已被停止/服务端限流
   */
  status: StatusCodes;
  /**
   * The response code mapping error message
   */
  errorMessage: StatusMessageMap[StatusCodes];
  /**
   * Response header
   */
  headers?: Record<string, string>;
};

export interface $RequestOptions extends RequestOptions {
  $$takeLatest?: boolean;
}

export interface RequestOptions {

  method?: 'POST' | 'GET';
  /**
   * Expect to return to the data format, the default JSON, support JSON, text, base64
   */
  dataType?: keyof DataTypeResultMap;
  /**
   * Unit of milliseconds, 30000 by default.
   */
  timeout?: number;
  /**
   * Set the http request header, default {'content-type': 'application/json'},
   * The object inside the key and the value must be a String type.
   */
  headers?: Record<string, string>;
  /**
   * For example
   * - the value true
   *  url: 'http://api.com/getUserInfo' => '/getUserInfo';
   *
   * - the value 'http://mock.com'
   *  url: 'http://api.com/getUserInfo' => 'http://mock.com/getUserInfo';
   */
  mock?: string | boolean;
  /**
   * Delay loading count, default 0. Unit of milliseconds
   */
  loadingDelay?: number;
  /**
   * The last request before his response do not allow the second request, default: true
   */
  preventIfLoading?: boolean;
}
