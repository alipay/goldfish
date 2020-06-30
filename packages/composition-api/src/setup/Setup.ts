import { wrap, getCurrent } from './globalStack';

/**
 * Base Setup class.
 *
 * The Setup class is used to record the set `setup` function's execute context.
 * For example:
 * 1. Record the registered lifecycle methods and execute them at the exact moments;
 * 2. Record the context type (App, Page, Component).
 *
 * @class
 */
export default class Setup {
  /**
   * The state of current setup flow.
   *
   * When entering the setup flow, the state is set to `START`, and the recording is executing.
   * When leave the setup flow, the state is set to `READY`, and the recording is stopped.
   *
   * @private
   * @type {('START' | 'READY')}
   * @memberof Setup
   */
  private state: 'START' | 'READY' = 'READY';

  /**
   * Get the current recorded setup object.
   */
  public static getCurrent<T extends Setup>() {
    return getCurrent<T>();
  }

  /**
   * Recording things to the map with the specified key.
   *
   * @param map
   * @param name
   * @param val
   */
  protected add(map: Record<string, any>, name: string, val: any) {
    if (this.state !== 'START') {
      throw new Error(`Wrong setup state while calling 'add' method: ${this.state}.`);
    }

    // Support recording multiple things in one key.
    const item = map[name];
    if (item) {
      item.push(val);
    } else {
      map[name] = [val];
    }
  }

  /**
   * Start executing setup flow.
   */
  protected start() {
    if (this.state !== 'READY') {
      throw new Error(`Wrong setup state while calling 'start' method: ${this.state}.`);
    }
    this.state = 'START';
  }

  /**
   * Clear the data when the setup flow finishes executing.
   */
  protected clear() {
    this.state = 'READY';
  }

  /**
   * Execute the setup function synchronously.
   *
   * @param setupFn
   */
  public wrap<R>(setupFn: () => R): R {
    try {
      this.start();
      const result = wrap(this, setupFn);
      return result;
    } catch (e) {
      throw e;
    } finally {
      this.clear();
    }
  }
}
