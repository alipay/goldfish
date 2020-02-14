import Store from './Store';
import AppStore from './AppStore';

export default abstract class PageStore<AS extends AppStore = AppStore> extends Store {
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
}
