import CacheContext from './CacheContext';

export interface IInstanceEvent<I extends Partial<Record<string, (...args: any[]) => any>>, T extends keyof I> {
  name: T;
  callback: Required<I>[T];
}

export default class InstanceEventContext<I> extends CacheContext<IInstanceEvent<I, keyof I>> {
  public add(value: IInstanceEvent<I, keyof I>) {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const oldItem = this.arr[this.index];
    if (!oldItem) {
      this.arr[this.index] = {
        value,
        deps: [],
      };
    } else if (oldItem.value.name !== value.name) {
      throw new Error(
        `Current event name does not equal with the previous one: current is ${value.name}, and the previous is ${oldItem.value.name}`,
      );
    } else {
      this.arr[this.index] = {
        value: {
          ...oldItem.value,
          callback: value.callback,
        },
        deps: [],
      };
    }

    this.index++;
  }

  public call(eventName: keyof I, app: any, ...args: any[]) {
    let result: any;
    this.arr.forEach(item => {
      if (item.value.name === eventName) {
        const callback: (...args: any[]) => any = item.value.callback as any;
        result = callback.call(app, ...args);
      }
    });
    return result;
  }

  public hasEventCallback(name: string) {
    return this.arr.some(item => item.value.name === name);
  }
}
