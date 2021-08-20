import createContextStack from '../common/createContextStack';
import isDependencyListEqual from '../common/isDependecyListEqual';
import CacheContext from './CacheContext';

const { push, pop, getCurrent } = createContextStack<CallbackContext>();

export { getCurrent };

export interface ICallbackFunction {
  (...args: any[]): any;
}

export default class CallbackContext extends CacheContext<ICallbackFunction> {
  public constructor() {
    super(push, pop);
  }

  public add(value: ICallbackFunction, deps: React.DependencyList = []) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const oldItem = this.arr[this.index];
    const newItem = {
      value: oldItem?.value,
      deps,
    };
    this.arr[this.index] = newItem;

    if (!oldItem || !isDependencyListEqual(oldItem.deps, deps)) {
      newItem.value = value;
    }

    this.index++;

    return newItem.value;
  }
}
