import Batch from '@goldfishjs/reactive-connect/lib/MiniDataSetter/Batch';
import ICreateComponentFunction from './ICreateComponentFunction';

const contextStack: Context[] = [];

function push(context: Context) {
  contextStack.push(context);
}

function pop() {
  contextStack.pop();
}

export function getCurrent() {
  return contextStack[contextStack.length - 1];
}

export default class Context {
  private state: 'ready' | 'executing' = 'ready';

  private index = 0;

  private arr: Array<{ value: any; setter: (v: any) => void }> = [];

  private view: { setData: tinyapp.SetDataMethod<any> };

  private batch: Batch;

  public constructor(view: { setData: tinyapp.SetDataMethod<any> }, onChange: () => void) {
    this.view = view;
    this.batch = new Batch(onChange);
  }

  public wrap(fn: ICreateComponentFunction) {
    if (this.state !== 'ready') {
      throw new Error(`Wrong state: ${this.state}. Expected: ready`);
    }
    this.state = 'executing';
    this.index = 0;
    push(this);
    try {
      const result = fn();
      this.view.setData(result.data);
    } catch (e) {
      throw e;
    } finally {
      pop();
      this.state = 'ready';
    }
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
}
