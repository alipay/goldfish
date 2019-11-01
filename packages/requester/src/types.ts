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
   * 响应码
   * - 11：无权跨域
   * - 12：网络出错
   * - 13：超时
   * - 14：解码失败
   * - 19：HTTP错误
   * - 20：请求已被停止/服务端限流
   */
  status: StatusCodes;
  /**
   * 响应码映射的错误信息
   */
  errorMessage: StatusMessageMap[StatusCodes];
  /**
   * 响应头
   */
  headers?: Record<string, string>;
};
export type RequestOptions = {
  method?: 'POST' | 'GET';
  /**
   * 期望返回的数据格式，默认JSON，支持JSON，text，base64
   */
  dataType?: keyof DataTypeResultMap;
  /**
   * 超时时间，单位 ms，默认 30000。
   */
  timeout?: number;
  /**
   * 设置请求的 HTTP 头对象，默认 {'content-type': 'application/json'}，该对象里面的 key 和 value 必须是 String 类型。
   */
  headers?: Record<string, string>;
  /**
   * datahub name
   */
  hub?: string;
  /**
   * 是否开启mock
   */
  mock?: boolean;
  /**
   * loadingCount延迟计数，默认不延迟
   */
  loadingDelay?: number;
  /**
   * 请求模式:
   *  - takeLatest 取最后一次请求，例如：在输入框搜索时使用
   *  - preventIfLoading 上一次请求未完成时不允许二次请求。
   */
  requestModel?: 'takeLatest' | 'preventIfLoading';
};
