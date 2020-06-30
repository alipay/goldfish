import { IHttpRequestOptions } from './httpRequest';
import { observable, state } from '@goldfishjs/reactive-connect';
import httpRequest from './httpRequest';

export interface IRequestOptions extends IHttpRequestOptions {
  showLoading?: boolean;
  delay?: number;
}

@observable
export default class Requester {
  @state
  public counter = 0;

  @state
  public loadingCounter = 0;

  public defaultOptions: Partial<IRequestOptions> = {
    showLoading: true,
    delay: 800,
  };

  public constructor(options?: Pick<IRequestOptions, 'showLoading' | 'delay' | 'method' | 'dataType'>) {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options,
    };
  }

  protected async send<R>(fetchFn: () => Promise<R>, options?: Partial<IRequestOptions>): Promise<R> {
    const realOptions = {
      ...this.defaultOptions,
      ...options,
    };

    let result;
    if (!realOptions.showLoading) {
      try {
        result = await fetchFn();
      } catch (e) {
        throw e;
      }
      return result;
    }

    const delay = realOptions.delay !== undefined ? realOptions.delay : 300;

    this.counter += 1;
    const cancel = (() => {
      let isIncreased = false;
      let timer: number;
      if (delay < 0) {
        this.loadingCounter += 1;
        isIncreased = true;
      } else {
        timer = setTimeout(() => {
          this.loadingCounter += 1;
          isIncreased = true;
        }, delay);
      }

      return () => {
        if (isIncreased) {
          this.loadingCounter -= 1;
        } else if (timer) {
          clearTimeout(timer);
        }
      };
    })();

    try {
      result = await fetchFn();
    } catch (e) {
      throw e;
    } finally {
      this.counter -= 1;
      cancel();
    }
    return result;
  }

  public request<R>(
    url: IRequestOptions['url'],
    data?: IRequestOptions['data'],
    options?: Omit<IRequestOptions, 'url' | 'params'>,
  ) {
    return this.send(() => {
      return httpRequest<R>({
        ...options,
        url,
        data,
      });
    }, options);
  }

  public destroy() {}
}
