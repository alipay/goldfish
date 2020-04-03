import { cloneDeep } from '@goldfishjs/utils';

export default class SpliceTree {
  private spliceObjectList: (Record<string, Parameters<Array<any>['splice']>>)[] = [];

  public addNode(
    keyPathString: string,
    newV: any[],
    oldV: any[],
  ) {
    if (newV.length > oldV.length) {
      this.spliceObjectList.push({
        [keyPathString]: [
          oldV.length,
          0,
          ...newV.slice(oldV.length, newV.length).map(item => cloneDeep(item)),
        ],
      });
    } else if (newV.length < oldV.length) {
      this.spliceObjectList.push({
        [keyPathString]: [
          newV.length,
          oldV.length - newV.length,
        ],
      });
    }
  }

  public generate() {
    return this.spliceObjectList;
  }

  public clear() {
    this.spliceObjectList = [];
  }
}
