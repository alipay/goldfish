import {
  RequestOptions,
  ResultData,
  IfNoInOut,
  IfNull,
  Request,
  $RequestOptions,
} from './utils/types';

// 1. 实现mock功能
// 2. 请求计数，当前有多少个请求
// 3. loading计数，当前有多少个loading(配置loading延迟)), 当loading 延迟为0时，请求计数 === loading计数
// 4. preventIfLoading
// 5. cache功能, 能使用forceRequest强制刷新

const defaultOptions: RequestOptions = {
  method: 'GET',
  dataType: 'JSON',
  timeout: 30000,
};

let loadingCount = 0;
let count = 0;
let loading = false;

const createRequest = <M = Record<string, any>>(
  options: $RequestOptions = defaultOptions,
) => <
  Url extends keyof M,
  ParamType extends IfNull<M, Url>,
  ReturnType extends ResultData<IfNoInOut<ParamType, 'out'>>
>(
      url: Url,
      param?: IfNoInOut<ParamType, 'in'>,
      overrideOptions?: RequestOptions,
    ): Promise<ReturnType> => {
  const finalOptions: RequestOptions = {
    ...options,
    ...defaultOptions,
    ...overrideOptions,
  };
  if (options.$$takeLatest) {
    finalOptions.preventIfLoading = false;
  }
  count += 1;
  let loadingEmit = false;
  let timerHandle: number;
  if (finalOptions.loadingDelay) {
    timerHandle = setTimeout(() => {
      loadingCount += 1;
      loadingEmit = true;
    }, finalOptions.loadingDelay);
  } else {
    loadingCount += 1;
    loadingEmit = true;
  }
  return new Promise((resolve, reject) => {
    if (finalOptions.preventIfLoading) {
      loading = true;
      if (loading) {
        return;
      }
    }
    (my.httpRequest || my.request)({
      url: url as string,
      data: param,
      method: finalOptions.method,
      timeout: finalOptions.timeout,
      success(res) {
        resolve(res as ReturnType);
      },
      fail(res) {
        reject(res);
      },
      complete() {
        if (loadingEmit) {
          loadingCount -= 1;
        }
        count -= 1;
        if (timerHandle) {
          clearTimeout(timerHandle);
        }
      },
    });
  });
};

export const getLoadingCount = (): number => loadingCount;

export const getRequestCount = (): number => count;

type realCreateRequest = <M = Record<string, any>>(
  options?: RequestOptions,
) => Request<M>;

export const $$innerCreateRequest = createRequest;

export default createRequest as realCreateRequest;
