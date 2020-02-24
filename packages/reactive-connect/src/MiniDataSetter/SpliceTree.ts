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
        [keyPathString]: [oldV.length, 0, ...args],
      });
    } else if (method === 'splice') {
      this.spliceObjectList.push({
        [keyPathString]: args as Parameters<Array<any>['splice']>,
      });
    } else if (method === 'unshift') {
      this.spliceObjectList.push({
        [keyPathString]: [0, 0, ...args],
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
