
type InOutParamTypes = {
  out?: any;
  in?: Record<string, any>;
};

type NullOrUndefined = undefined | null;

export type DefaultTypeIfNullOrUndefined<
  M,
  Key extends keyof M
> = M extends NullOrUndefined
  ? InOutParamTypes
  : (M[Key] extends NullOrUndefined ? InOutParamTypes : M[Key]);

export type PickInOrOutType<M, Key extends 'in' | 'out'> = Key extends keyof M
  ? M[Key]
  : any;

type DataTypeResultMap = {
  JSON: Record<string, any>;
  text: string;
  base64: string;
};

type StatusMessageMap = {
  11: 'No permission to cross domain';
  12: 'Network error';
  13: 'Timeout';
  14: 'Decoding failure';
  19: 'HTTP error';
  20: 'The request has been stopped/The service side flow restrictions';
};

type StatusCodes = keyof StatusMessageMap;

export type PromiseCreator<T = any> = (...args: any[]) => Promise<T>;

export type WithForceUpdate<T> = T & {
  forceRefresh: T;
};

export type Request<M = Record<string, any>> = <
  Url extends Extract<keyof M, string>,
  ParamType extends DefaultTypeIfNullOrUndefined<M, Url>,
  ResultType extends ResultData<PickInOrOutType<ParamType, 'out'>>
>(
  url: Url,
  param?: PickInOrOutType<ParamType, 'in'>,
  overrideOptions?: RequestOptions,
) => Promise<ResultType>;

export type ResultData<T> = {
  data: T extends (null | undefined)
    ? DataTypeResultMap[keyof DataTypeResultMap]
    : T;
  /**
   * Response code
   * - 11：No permission to cross domain
   * - 12：Network error
   * - 13：Timeout
   * - 14：Decoding failure
   * - 19：HTTP error
   * - 20：The request has been stopped/The service side flow restrictions
   */
  status: StatusCodes;
  /**
   * Response header
   */
  headers?: Record<string, string>;
};

export type $RequestOptions = {
  $$takeLatest?: boolean;
} & RequestOptions;

export type RequestOptions = {
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
};
