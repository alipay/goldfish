import Store from './Store';
import AppStore from './AppStore';

export interface IProps {}

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

  public isSyncDataSafe: boolean = true;

  public abstract props: P;

  public getStateKeys() {
    return super.getStateKeys().filter(key => key !== 'props');
  }
}
