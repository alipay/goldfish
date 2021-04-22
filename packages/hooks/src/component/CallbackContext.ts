import Context from '../common/Context';
import isDependencyListEqual from '../common/isDependecyListEqual';

const callbackContextStack: CallbackContext[] = [];

function push(context: CallbackContext) {
  callbackContextStack.push(context);
}

function pop() {
  callbackContextStack.pop();
}

export function getCurrent() {
  return callbackContextStack[callbackContextStack.length - 1];
}

export interface ICallbackFunction {
  (...args: any[]): any;
}

export default class CallbackContext extends Context {
  private callback: ICallbackFunction | null = null;
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

  public set(callback: ICallbackFunction, deps: React.DependencyList = []) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    // The first time.
    if (!this.callback && !this.deps) {
      this.callback = callback;
      this.deps = deps;
    } else if (this.callback && this.deps) {
      // Compare the exists deps with the new deps.
      if (!isDependencyListEqual(this.deps, deps)) {
        this.callback = callback;
        this.deps = deps;
      }
    } else {
      throw new Error('The callback and deps can not both be missed.');
    }
    return this.callback;
  }

  public destroy() {
    this.callback = null;
    this.deps = null;
  }
}