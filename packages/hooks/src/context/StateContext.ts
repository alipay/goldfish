import Batch from '@goldfishjs/reactive-connect/lib/MiniDataSetter/Batch';
import Context from './Context';
import createContextStack from '../common/createContextStack';
import { ICreateFunction } from '../connector/create';

const { push, pop, getCurrent } = createContextStack<StateContext>();

export default class StateContext extends Context {
  public static get current() {
    return getCurrent();
  }

  private index = 0;

  private arr: Array<{ value: any; setter: (v: any) => void }> = [];

  private view: { setData: tinyapp.SetDataMethod<any> };

  private batch: Batch;

  private onUpdated: () => void;

  public constructor(view: { setData: tinyapp.SetDataMethod<any> }, onChange: () => void, onUpdated: () => void) {
    super();
    this.view = view;
    this.batch = new Batch(onChange);
    this.onUpdated = onUpdated;
  }

  public wrap(fn: () => ReturnType<ICreateFunction<any>>) {
    return () => {
      this.index = 0;
      push(this);
      try {
        const result = super.wrapExecutor(fn);
        // TODO: performance optimization
        this.view.setData(result.data, () => Promise.resolve().then(this.onUpdated));
        return result;
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
        if (this.state === 'executing') {
          throw new Error(`Do not set state in the render.`);
        }
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
