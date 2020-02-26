export default class Batch {
  private segTotalList: number[] = [];

  private counter = 0;

  private cb: () => void;

  public constructor(cb: () => void) {
    this.cb = cb;
  }

  public async set() {
    const segIndex = this.counter === 0
      ? this.segTotalList.length
      : (this.segTotalList.length - 1);

    if (!this.segTotalList[segIndex]) {
      this.segTotalList[segIndex] = 0;
    }

    this.counter += 1;
    this.segTotalList[segIndex] += 1;

    await Promise.resolve();

    this.counter -= 1;

    // The last invoke of `set`
    if (this.counter === 0) {
      const segLength = this.segTotalList.length;
      await Promise.resolve();
      if (this.segTotalList.length === segLength) {
        this.cb();
        this.counter = 0;
        this.segTotalList = [];
      }
    }
  }
}
