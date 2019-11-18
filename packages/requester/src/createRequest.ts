import mockUrl from './utils/mockUrl';
import {
  RequestOptions,
  ResultData,
  PickInOrOutType,
  DefaultTypeIfNullOrUndefined,
  $RequestOptions,
} from './types';

const defaultOptions: RequestOptions = {
  method: 'GET',
  dataType: 'JSON',
  timeout: 30000,
};

let loadingCount = 0;
let count = 0;
let loading = false;

const createRequest = <M = Record<string, any>>(
  options: RequestOptions = defaultOptions,
) => <
  Url extends Extract<keyof M, string>,
  ParamType extends DefaultTypeIfNullOrUndefined<M, Url>,
  ResultType extends ResultData<PickInOrOutType<ParamType, 'out'>>
>(
      url: Url,
      param?: PickInOrOutType<ParamType, 'in'>,
      overrideOptions?: RequestOptions,
    ): Promise<ResultType> => {
  const finalOptions: RequestOptions = {
    ...defaultOptions,
    ...options,
    ...overrideOptions,
  };
  if ((options as $RequestOptions).$$takeLatest) {
    finalOptions.preventIfLoading = false;
  }
  count += 1;
  let loadingEmit = false;
  let timerHandle: any;
  if (finalOptions.loadingDelay) {
    timerHandle = setTimeout(() => {
      loadingCount += 1;
      loadingEmit = true;
    }, finalOptions.loadingDelay);
  } else {
    loadingCount += 1;
    loadingEmit = true;
  }

  if (process.env.NODE_ENV === 'development') {
    url = mockUrl(url, finalOptions.mock) as Url;
  }

  return new Promise((resolve, reject) => {
    if (finalOptions.preventIfLoading) {
      loading = true;
      if (loading) {
        return;
      }
    }
    (my.request || my.httpRequest)({
      url,
      data: param,
      method: finalOptions.method,
      timeout: finalOptions.timeout,
      success(res) {
        resolve(res as ResultType);
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

export default createRequest;
