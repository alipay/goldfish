import { GetPlugin } from './Plugin';
import { MockRequester } from '@goldfishjs/requester';
import ConfigPlugin from './ConfigPlugin';
import RequesterPlugin from './RequesterPlugin';

export default class MockRequesterPlugin extends RequesterPlugin {
  public async init(getPlugin: GetPlugin) {
    const configPlugin = getPlugin(ConfigPlugin);
    const options = configPlugin.get('requesterOptions');
    const datahubOptions = configPlugin.get('datahubConfig');
    this.requester = new MockRequester(options, datahubOptions);
  }

  public destroy() {}
}
