import Store from './Store';
import AppStore from './AppStore';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface IProps {}
/* eslint-enable @typescript-eslint/no-empty-interface */

export default abstract class ComponentStore<P extends IProps, AS = AppStore> extends Store {
  private $$appStore?: AS;

  public get appStore() {
    if (!this.$$appStore) {
      throw new Error('No `appStore`.');
    }
    return this.$$appStore;
  }

  public set appStore(v: AS) {
    this.$$appStore = v;
  }

  public isSyncDataSafe = true;

  public abstract props: P;

  public getStateKeys() {
    return super.getStateKeys().filter(key => key !== 'props');
  }
}
