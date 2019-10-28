import Store from './Store';
import AppStore from './AppStore';

export interface IProps {}

export default abstract class ComponentStore<P extends IProps, GS = AppStore> extends Store {
  public globalStore!: GS;

  public isSyncDataSafe: boolean = true;

  public abstract props: P;
}
