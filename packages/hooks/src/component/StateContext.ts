import Batch from '@goldfishjs/reactive-connect/lib/MiniDataSetter/Batch';
import Context from '../common/Context';
import createContextStack from '../common/createContextStack';
import ICreateComponentFunction from './ICreateComponentFunction';

const { push, pop, getCurrent } = createContextStack<StateContext>();

export default class StateContext extends Context {
  public static get current() {
    return getCurrent();
  }

  private index = 0;

  private arr: Array<{ value: any; setter: (v: any) => void }> = [];

  private view: { setData: tinyapp.SetDataMethod<any> };

  private batch: Batch;

  public constructor(view: { setData: tinyapp.SetDataMethod<any> }, onChange: () => void) {
    super();
    this.view = view;
    this.batch = new Batch(onChange);
  }

  public wrap(fn: () => ReturnType<ICreateComponentFunction<any>>) {
    return () => {
      this.index = 0;
      push(this);
      try {
        const result = super.wrapExecutor(fn);
        // TODO: performance optimization
        this.view.setData(result.data);
      } catch (e) {
        throw e;
      } finally {
        pop();
      }
    };
  }

  public add<V>(value: V): [V, (v: V) => void] {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const item = this.arr[this.index] || {
      value,
      setter: (v: V) => {
        const isChanged = item.value !== v;
        item.value = v;
        if (isChanged) {
          this.batch.set();
        }
      },
    };
    this.arr[this.index] = item;

    const result: [V, (v: V) => void] = [item.value, item.setter];
    this.index += 1;
    return result;
  }

  destroy() {
    if (this.state !== 'ready') {
      throw new Error(`Wrong state: ${this.state}. Expected: ready`);
    }

    this.arr = [];
  }
}
