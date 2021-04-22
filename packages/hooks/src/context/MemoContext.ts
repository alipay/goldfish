import Context from './Context';
import createContextStack from '../common/createContextStack';
import isDependencyListEqual from '../common/isDependecyListEqual';

const { push, pop, getCurrent } = createContextStack<MemoContext>();

export default class MemoContext extends Context {
  public static get current() {
    return getCurrent();
  }

  private value: any = null;

  private deps: React.DependencyList | null = null;

  public wrap(fn: () => void) {
    return () => {
      push(this);
      try {
        super.wrapExecutor(fn);
      } catch (e) {
        throw e;
      } finally {
        pop();
      }
    };
  }

  public set(callback: () => any, deps: React.DependencyList = []) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    // The first time.
    if (!this.deps) {
      this.deps = deps;
      this.value = callback();
    } else if (!isDependencyListEqual(this.deps, deps)) {
      this.value = callback();
      this.deps = deps;
    }
    return this.value;
  }

  public destroy() {
    this.value = null;
    this.deps = null;
  }
}
