import Context from '../common/Context';
import ICreateComponentFunction from './ICreateComponentFunction';

const effectContextStack: EffectContext[] = [];

function push(context: EffectContext) {
  effectContextStack.push(context);
}

function pop() {
  effectContextStack.pop();
}

export function getCurrent() {
  return effectContextStack[effectContextStack.length - 1];
}

export default class EffectContext extends Context {
  private arr: Array<{
    effect: React.EffectCallback;
    deps: { old: React.DependencyList; new: React.DependencyList };
  }> = [];

  private index = 0;

  public wrap(fn: () => ReturnType<ICreateComponentFunction<any>>) {
    push(this);
    try {
      super.wrapExecutor(fn);
    } catch (e) {
      throw e;
    } finally {
      pop();
    }
  }

  public add(effect: React.EffectCallback, deps?: React.DependencyList) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const item = this.arr[this.index] || {
      effect,
      deps,
    };
    this.arr[this.index] = item;

    const result: [V, (v: V) => void] = [item.value, item.setter];
    this.index += 1;
    return result;
  }
}
