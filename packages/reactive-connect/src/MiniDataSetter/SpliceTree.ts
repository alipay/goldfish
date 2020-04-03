import { cloneDeep } from '@goldfishjs/utils';

export type Methods = 'push' | 'splice' | 'unshift' | 'pop' | 'shift';

export default class SpliceTree {
  private spliceObjectList: (Record<string, Parameters<Array<any>['splice']>>)[] = [];

  public addNode<M extends Methods>(
    keyPathString: string,
    method: M,
    args: Parameters<Array<any>[M]>,
    oldV: any[],
  ) {
    if (method === 'push') {
      this.spliceObjectList.push({
        [keyPathString]: [
          oldV.length,
          0,
          ...(args as any[]).map(item => cloneDeep(item)),
        ],
      });
    } else if (method === 'splice') {
      const realArgs = args as Parameters<Array<any>['splice']>;
      this.spliceObjectList.push({
        [keyPathString]: [
          realArgs[0],
          realArgs[1],
          ...(realArgs[2] || []).map((item: any) => cloneDeep(item)),
        ],
      });
    } else if (method === 'unshift') {
      this.spliceObjectList.push({
        [keyPathString]: [
          0,
          0,
          ...((args || []) as any[]).map((item: any) => cloneDeep(item)),
        ],
      });
    } else if (method === 'pop') {
      this.spliceObjectList.push({
        [keyPathString]: [oldV.length - 1, 1],
      });
    } else if (method === 'shift') {
      this.spliceObjectList.push({
        [keyPathString]: [0, 1],
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
