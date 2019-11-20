import Requester, { IRequestOptions } from './Requester';

export interface IDatahubConfig {
  host: string;
  protocol: 'http' | 'https';
  port: number;
}

export default class MockRequester extends Requester {
  private datahubConfig?: IDatahubConfig;

  public constructor(
    options?: Pick<IRequestOptions, 'showLoading' | 'delay' | 'method' | 'dataType'>,
    config?: IDatahubConfig,
  ) {
    super(options);
    this.datahubConfig = config;
  }

  protected requestDatahub<R>(
    url: IRequestOptions['url'],
    data?: IRequestOptions['data'],
    options?: Omit<IRequestOptions, 'url' | 'params'>,
  ) {
    if (!this.datahubConfig) {
      return super.request<R>(url, data, options);
    }

    const { protocol, host, port } = this.datahubConfig;
    const realUrl = `${protocol}://${host}:${port}${url.replace(/^https?:\/\/[^/]*\//, '/')}`;
    return super.request<R>(realUrl, data, options);
  }

  public request<R>(
    url: IRequestOptions['url'],
    data?: IRequestOptions['data'],
    options?: Omit<IRequestOptions, 'url' | 'params'>,
  ) {
    return this.requestDatahub<R>(url, data, options);
  }
}
