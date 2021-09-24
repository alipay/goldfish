export default class Batch {
  private segTotalList: number[] = [];

  private counter = 0;

  private cb: () => void;

  private isCallingCb = false;

  public constructor(cb: () => void) {
    this.cb = cb;
  }

  public async set(): Promise<void> {
    if (this.isCallingCb) {
      console.warn('Caution: the callback function is currently being called synchronously!');
    }

    const segIndex = this.counter === 0 ? this.segTotalList.length : this.segTotalList.length - 1;

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
        this.counter = 0;
        this.segTotalList = [];

        this.isCallingCb = true;
        try {
          this.cb();
        } catch (e) {
          throw e;
        } finally {
          this.isCallingCb = false;
        }
      }
    }
  }
}
