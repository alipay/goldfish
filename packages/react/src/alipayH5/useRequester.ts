/* eslint-disable react-hooks/rules-of-hooks */
import { Requester as BaseRequester, IRequestOptions } from '@goldfishjs/requester';
import { default as App, app } from '../App';
import useGlobalConfig from '../useGlobalConfig';
import { bridge } from './useBridge';
import useGlobalDestroy from '../useGlobalDestroy';

const KEY = 'plugin.requester';

class Requester extends BaseRequester {
  protected encodeData(options: Omit<IRequestOptions, 'url' | 'params'>) {
    if (!options.data) {
      return '';
    }

    if (
      options.method === 'GET' ||
      (options.headers && options.headers['content-type'] === 'application/x-www-form-urlencoded')
    ) {
      const arr: string[] = [];
      for (const key in options.data) {
        arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(options.data[key]))}`);
      }
      return arr.join('&');
    }

    if (options.method === 'POST' && options.headers && options.headers['content-type'] === 'application/json') {
      return JSON.stringify(options.data);
    }
  }

  public request<R>(
    url: IRequestOptions['url'],
    data?: IRequestOptions['data'],
    options?: Omit<IRequestOptions, 'url' | 'params'>,
  ): Promise<R> {
    return this.send(() => {
      return new Promise<R>(resolve => {
        const requestData = this.encodeData(data || {});
        bridge.call(
          'httpRequest',
          {
            url,
            headers: options?.headers,
            method: options?.method,
            data: requestData,
            timeout: options?.timeout,
          },
          result => {
            resolve(result as any);
          },
        );
      });
    }, options);
  }
}

export default function useRequester(passInApp?: App) {
  const realGlobal = passInApp || app;

  if (!realGlobal.normalData[KEY]) {
    const config = useGlobalConfig(realGlobal);
    const options = config.get('requesterOptions');
    const requester = new Requester(options);
    realGlobal.normalData[KEY] = requester;
    useGlobalDestroy(() => {
      requester.destroy();
    });
  }

  return realGlobal.normalData[KEY] as Requester;
}
