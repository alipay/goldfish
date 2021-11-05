import Batch from '@goldfishjs/reactive-connect/lib/MiniDataSetter/Batch';
import cloneDeep from '@goldfishjs/utils/lib/cloneDeep';
import silent from '@goldfishjs/utils/lib/silent';
import diff, { Operation } from '../common/diff';
import Context from './Context';
import createContextStack from '../common/createContextStack';
import { CreateFunction } from '../connector/create';
import isFunction from '../common/isFunction';
import View from '../common/View';

const { push, pop, getCurrent } = createContextStack<StateContext>();

class DataSetter {
  private count = new Batch(() => this.flush());

  private viewMap: Record<string, View | null> = {};

  private operationsMap: Record<string, Operation[]> = {};

  private updatedListeners: Record<string, Array<() => void>> = {};

  private previousDataMap: Record<string, any> = {};

  private getBatchUpdates(view: View) {
    return view.$batchedUpdates ? view.$batchedUpdates.bind(view) : view.$page.$batchedUpdates.bind(view.$page);
  }

  private flush() {
    const delayUpdateFns: Array<() => void> = [];
    for (const id in this.viewMap) {
      const operations = this.operationsMap[id];
      const view = this.viewMap[id];
      const promiseList: Promise<void>[] = [];

      if (!view) {
        continue;
      }

      delayUpdateFns.push(() => {
        const isSyncDataSafe = view.$$isSyncDataSafe === false ? false : true;
        if (!isSyncDataSafe) {
          return;
        }

        this.getBatchUpdates(view)(() => {
          operations.forEach(operation => {
            if (operation.type === 'set') {
              promiseList.push(
                new Promise<void>(resolve => {
                  view.setData(operation.value, resolve);
                }),
              );
            } else {
              promiseList.push(
                new Promise<void>(resolve => {
                  view.$spliceData(
                    {
                      [operation.keyPathString]: [operation.start, operation.deleteCount, ...operation.values],
                    },
                    resolve,
                  );
                }),
              );
            }
          });
        });
        Promise.all(promiseList).then(() => {
          this.invokeUpdatedListeners(id);
        });
      });
    }
    this.viewMap = {};
    this.operationsMap = {};

    delayUpdateFns.forEach(fn => fn());
  }

  private getViewId(view: View) {
    return (view.$id === undefined ? view.$viewId : view.$id) as string;
  }

  public addUpdatedListener(view: View, cb: () => void) {
    const viewId = this.getViewId(view);
    this.updatedListeners[viewId] = this.updatedListeners[viewId] || [];
    this.updatedListeners[viewId].push(cb);
    return () => {
      this.updatedListeners[viewId] = this.updatedListeners[viewId].filter(item => item !== cb);
    };
  }

  private invokeUpdatedListeners(viewId: string) {
    const updatedListeners = this.updatedListeners[viewId];
    updatedListeners.forEach(cb => cb && silent(cb)());
  }

  public set(view: View, data: any) {
    const viewId = this.getViewId(view);
    if (!this.previousDataMap[viewId]) {
      view.setData(data, () => Promise.resolve().then(() => this.invokeUpdatedListeners(viewId)));
      this.previousDataMap[viewId] = cloneDeep(data);
      return;
    }

    this.operationsMap[viewId] = this.operationsMap[viewId] || [];
    this.viewMap[viewId] = view;

    const operations = this.operationsMap[viewId];
    const currentOperations = diff(this.previousDataMap[viewId], data);
    if (!currentOperations.length) {
      Promise.resolve().then(() => this.invokeUpdatedListeners(viewId));
      return;
    }

    operations.push(...currentOperations);
    this.operationsMap[viewId] = operations;
    this.count.set();
    this.previousDataMap[viewId] = cloneDeep(data);
  }

  public clearByView(view: View) {
    const viewId = this.getViewId(view);
    this.viewMap[viewId] = null;
    this.operationsMap[viewId] = [];
    this.updatedListeners[viewId] = [];
    this.previousDataMap[viewId] = undefined;
  }
}

const dataSetter = new DataSetter();

export default class StateContext extends Context {
  public static get current() {
    return getCurrent();
  }

  private index = 0;

  private arr: Array<{ value: any; setter: (v: any) => void }> = [];

  private view: View;

  private batch: Batch;

  public constructor(view: View, onChange: () => void, onUpdated: () => void) {
    super();
    this.view = view;
    this.batch = new Batch(onChange);

    dataSetter.addUpdatedListener(this.view, onUpdated);
  }

  public wrap(fn: () => ReturnType<CreateFunction>) {
    return () => {
      this.index = 0;
      push(this);
      try {
        const result = super.wrapExecutor(fn);
        dataSetter.set(this.view, result.data);

        // Mount the functions to the view.
        for (let key in result) {
          if (result[key] instanceof Function) {
            (this.view as any)[key] = result[key];
          }
        }
        return result;
      } catch (e) {
        throw e;
      } finally {
        pop();
      }
    };
  }

  public add<V>(value: V | ((prevState: V) => V)): [V, (v: V) => void] {
    if (this.state !== 'executing') {
      throw new Error(`Wrong state: ${this.state}. Expected: executing`);
    }

    const getRealV = (v: any, previousV?: any): any => {
      return isFunction(v) ? v(previousV) : v;
    };

    const item = this.arr[this.index] || {
      value: getRealV(value),
      setter: (v: V) => {
        if (this.state === 'executing') {
          throw new Error(`Do not set state in the render.`);
        }
        const realV = getRealV(v, item.value);
        const isChanged = item.value !== realV;
        item.value = realV;
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
    dataSetter.clearByView(this.view);
  }
}
