import { Setup } from '@goldfishjs/composition-api';

export default class ComponentSetup extends Setup {
  private stopList: Function[] = [];

  public setupFnResult: any;

  public setStopList(list: Function[]) {
    this.stopList = list;
  }

  public removeAllStopList() {
    this.stopList.forEach(s => s());
    this.stopList = [];
  }
}
