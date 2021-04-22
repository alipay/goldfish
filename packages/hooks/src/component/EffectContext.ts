import Context from '../common/Context';
import createContextStack from '../common/createContextStack';
import isDependencyListEqual from '../common/isDependecyListEqual';

const { push, pop, getCurrent } = createContextStack<EffectContext>();

export default class EffectContext extends Context {
  public static get current() {
    return getCurrent();
  }

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

    if (!oldItem || (oldItem.deps.length === 0 && deps.length === 0) || !isDependencyListEqual(oldItem.deps, deps)) {
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
