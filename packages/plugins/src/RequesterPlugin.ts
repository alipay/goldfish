import Plugin, { GetPlugin } from './Plugin';
import { Requester, IRequestOptions } from '@goldfishjs/requester';
import ConfigPlugin from './ConfigPlugin';

export default class RequesterPlugin extends Plugin {
  private requester?: Requester;

  public init(getPlugin: GetPlugin) {
    const configPlugin = getPlugin(ConfigPlugin);
    const options = configPlugin.get('requesterOptions');
    this.requester = new Requester(options);
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
