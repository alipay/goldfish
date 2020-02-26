export default class LimitLeafCounter {
  private limitLeafTotalCount: number;

  private leafTotalCount = 0;

  public constructor(count = 100) {
    this.limitLeafTotalCount = count;
  }

  public addLeaf() {
    this.leafTotalCount += 1;
  }

  public getRemainCount() {
    return this.limitLeafTotalCount - this.leafTotalCount;
  }
}
