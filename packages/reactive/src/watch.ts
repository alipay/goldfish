import { call, getCurrent, IErrorCallback, SourceType } from './dep';
import { isObject, isArray } from './utils';

export type Unwatch = () => void;
export type IWatchCallback<N, O = any> = (newValue: N, oldValue?: O) => void;
export type IWatchExpressionFn<R> = () => R;

export interface IWatchOptions {
  deep?: boolean;
  immediate?: boolean;
  onError?: IErrorCallback;
}

class Watcher<R> {
  private isStopped = false;

  private cb: IWatchCallback<R>;

  private options: IWatchOptions;

  private fn: IWatchExpressionFn<R>;

  private isFirstTime = true;

  constructor(
    fn: IWatchExpressionFn<R>,
    cb: IWatchCallback<R>,
    options: IWatchOptions,
  ) {
    this.fn = fn;
    this.cb = cb;
    this.options = options;

    this.watch();
  }

  public stop() {
    this.isStopped = true;
  }

  // 递归访问一下，方便搜集依赖
  private deepVisit(obj: any) {
    if (isObject(obj)) {
      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
          continue;
        }

        this.deepVisit(obj[key]);
      }
    } else if (isArray(obj)) {
      for (let i = 0, il = obj.length; i < il; i += 1) {
        this.deepVisit(obj[i]);
      }
    }
  }

  private watch() {
    let result: any;

    call(
      () => {
        result = this.fn();
        if (this.options.deep) {
          this.deepVisit(result);
        }
        getCurrent().addChangeListener((n: any, o: any, type: SourceType) => {
          if (this.isStopped) {
            return;
          }

          const currentResult = this.watch();
          if (this.options.deep || type === 'notify' || currentResult !== result) {
            try {
              this.cb(currentResult, result);
            } catch (e) {
              this.options.onError && this.options.onError(e);
            }
          }
        });
      },
      this.options.onError,
    );

    if (this.isFirstTime && this.options.immediate) {
      this.isFirstTime = false;
      Promise.resolve().then(
        () => {
          this.cb(result);
        },
      ).catch(
        (e) => {
          this.options.onError && this.options.onError(e);
        },
      );
    }

    return result;
  }
}

export default function watch<R>(
  fn: IWatchExpressionFn<R>,
  cb: IWatchCallback<R>,
  options: IWatchOptions = { deep: false, immediate: false },
): Unwatch {
  const watcher = new Watcher(fn, cb, options);
  return () => watcher.stop();
}
