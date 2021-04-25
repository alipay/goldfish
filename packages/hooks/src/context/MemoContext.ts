import createContextStack from '../common/createContextStack';
import isDependencyListEqual from '../common/isDependecyListEqual';
import CacheContext from './CacheContext';

const { push, pop, getCurrent } = createContextStack<MemoContext>();

export { getCurrent };

export default class MemoContext extends CacheContext<() => any> {
  public constructor() {
    super(push, pop);
  }

  public add(memoFn: () => any, deps: React.DependencyList = []) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const currentIndex = this.index;
    const oldItem = this.arr[currentIndex];
    const newItem = {
      value: oldItem?.value,
      deps,
    };
    this.arr[currentIndex] = newItem;

    if (!oldItem || !isDependencyListEqual(oldItem.deps, deps)) {
      newItem.value = memoFn();
    }

    this.index++;

    return newItem.value;
  }
}
