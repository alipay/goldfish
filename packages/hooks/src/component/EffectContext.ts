import Context from '../common/Context';

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
    deps: React.DependencyList;
    isChanged: boolean;
    destroyFn?: ReturnType<React.EffectCallback>;
  }> = [];

  private index = 0;

  public wrap(fn: () => void) {
    return () => {
      this.index = 0;
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

  private isEqual(oldDeps: React.DependencyList, newDeps: React.DependencyList) {
    if (oldDeps.length !== newDeps.length) {
      return false;
    }

    for (let i = 0, il = oldDeps.length; i < il; i += 1) {
      if (oldDeps[i] !== newDeps[i]) {
        return false;
      }
    }

    return true;
  }

  public add(effect: React.EffectCallback, deps: React.DependencyList = []) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const oldItem = this.arr[this.index];
    const newItem = {
      effect: oldItem?.effect || effect,
      deps,
      isChanged: oldItem?.isChanged || false,
      destroyFn: oldItem?.destroyFn,
    };
    this.arr[this.index] = newItem;

    if (!oldItem || (oldItem.deps.length === 0 && deps.length === 0) || !this.isEqual(oldItem.deps, deps)) {
      newItem.isChanged = true;
      newItem.effect = effect;
    }

    this.index += 1;
  }

  public executeEffect() {
    if (this.state !== 'ready') {
      throw new Error(`Wrong state: ${this.state}. Expected: ready`);
    }

    this.arr.forEach(item => {
      if (!item.isChanged) {
        return;
      }

      try {
        if (item.destroyFn) {
          item.destroyFn();
        }
        item.destroyFn = item.effect();
      } catch (e) {
        throw e;
      } finally {
        item.isChanged = false;
      }
    });
  }

  public destroy() {
    this.arr.forEach(item => {
      if (item.destroyFn) {
        item.destroyFn();
      }
    });
  }
}
