export default class Context {
  protected state: 'ready' | 'executing' = 'ready';

  protected wrapExecutor<R>(fn: () => R) {
    if (this.state !== 'ready') {
      throw new Error(`Wrong state: ${this.state}. Expected: ready`);
    }
    this.state = 'executing';
    try {
      const result = fn();
      return result;
    } catch (e) {
      throw e;
    } finally {
      this.state = 'ready';
    }
  }
}
