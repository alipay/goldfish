import Plugin, { GetPlugin } from './Plugin';
import { MockRequester, IRequestOptions } from '@alipay/goldfish-requester';
import ConfigPlugin from './ConfigPlugin';

export default class RequesterPlugin extends Plugin {
  private requester?: MockRequester;

  public init(getPlugin: GetPlugin) {
    const configPlugin = getPlugin(ConfigPlugin);
    const options = configPlugin.get('requesterOptions');
    const datahubOptions = configPlugin.get('datahubConfig');
    this.requester = new MockRequester(options, datahubOptions);
  }

  public request<R>(
    url: IRequestOptions['url'],
    data?: IRequestOptions['data'],
    options?: Omit<IRequestOptions, 'url' | 'params'>,
  ) {
    if (!this.requester) {
      throw new Error('The requester is not ready.');
    }

    return this.requester.request<R>(url, data, options);
  }

  public destroy() {}
}
