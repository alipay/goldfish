import { Requester, IRequestOptions } from '@goldfishjs/requester';
import Plugin, { GetPlugin } from './Plugin';
import ConfigPlugin from './ConfigPlugin';

export default class RequesterPlugin extends Plugin {
  public static type = 'requester';

  protected requester?: Requester;

  public async init(getPlugin: GetPlugin) {
    const configPlugin = getPlugin(ConfigPlugin);
    const options = configPlugin.get('requesterOptions');
    this.requester = new Requester(options);
  }

  public async request<R>(
    url: IRequestOptions['url'],
    data?: IRequestOptions['data'],
    options?: Omit<IRequestOptions, 'url' | 'params'>,
  ) {
    await this.waitForReady();
    if (!this.requester) {
      throw new Error('The requester is not ready.');
    }

    return this.requester.request<R>(url, data, options);
  }

  public destroy() {}
}
