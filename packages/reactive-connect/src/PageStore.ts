import Store from './Store';
import AppStore from './AppStore';

export default abstract class PageStore<GS extends AppStore = AppStore> extends Store {
  public globalStore!: GS;

  public isSyncDataSafe: boolean = true;
}
