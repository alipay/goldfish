import Batch from '@goldfishjs/reactive-connect/lib/MiniDataSetter/Batch';
import cloneDeepWith from '@goldfishjs/utils/lib/cloneDeepWith';
import silent from '@goldfishjs/utils/lib/silent';
import getViewId from '@goldfishjs/reactive-connect/lib/MiniDataSetter/getViewId';
import diff, { Operation } from '../common/diff';
import Context from './Context';
import createContextStack from '../common/createContextStack';
import { CreateFunction } from '../connector/create';
import isFunction from '../common/isFunction';

export type Status = 'initializing' | 'ready' | 'destroyed';

function cloneDeep(obj: any) {
  return cloneDeepWith(obj, (v: any) => {
    if (typeof v === 'function') {
      return v;
    }
  });
}

export interface IView {
  setData(data: Record<string, any>, callback?: () => void): void;
  batchedUpdates(fn: () => void): void;
  spliceData(data: Record<string, [number, number, ...any[]]>, callback: () => void): void;
  status: Status;
  addStatusChangeListener(listener: (status: Status) => void): () => void;
  renderDataResult?: Record<string, any>;
}

const { push, pop, getCurrent } = createContextStack<StateContext>();

class DataSetter {
  private count = new Batch(() => this.flush());

  private viewMap: Record<string, IView | null> = {};

  private operationsMap: Record<string, Operation[]> = {};

  private updatedListeners: Record<string, Array<() => void>> = {};

  private previousDataMap: Record<string, any> = {};

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
        const isSyncDataSafe = view.status === 'ready';
        if (!isSyncDataSafe) {
          return;
        }

        view.batchedUpdates(() => {
          operations.forEach(operation => {
            if (operation.type === 'set') {
              promiseList.push(
                new Promise<void>(resolve => {
                  // cloneDeep: Prevent pollution data on the instance.
                  view.setData(cloneDeep(operation.value), resolve);
                }),
              );
            } else {
              promiseList.push(
                new Promise<void>(resolve => {
                  view.spliceData(
                    {
                      [operation.keyPathString]: [
                        operation.start,
                        operation.deleteCount,
                        // cloneDeep: Prevent pollution data on the instance.
                        ...cloneDeep(operation.values),
                      ],
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

  public addUpdatedListener(view: IView, cb: () => void) {
    const viewId = getViewId(view);
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

  public set(view: IView, data: any) {
    const viewId = getViewId(view);
    if (!this.previousDataMap[viewId]) {
      // cloneDeep: Prevent pollution data on the instance.
      view.setData(cloneDeep(data), () => Promise.resolve().then(() => this.invokeUpdatedListeners(viewId)));
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

  public clearByView(view: IView) {
    const viewId = getViewId(view);
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

  private view: IView;

  private batch: Batch;

  private syncFnInInitializingStage: (() => void)[] = [];

  private stopStatusChangeListener: () => void;

  public constructor(view: IView, onChange: () => void, onUpdated: () => void) {
    super();
    this.view = view;
    this.batch = new Batch(onChange);

    dataSetter.addUpdatedListener(this.view, onUpdated);

    this.stopStatusChangeListener = this.view.addStatusChangeListener(() => {
      this.syncFnInInitializingStage.forEach(f => f());
      this.syncFnInInitializingStage = [];
    });
  }

  public wrap(fn: () => ReturnType<CreateFunction>) {
    return () => {
      this.index = 0;
      push(this);
      try {
        const result = super.wrapExecutor(fn);

        this.view.renderDataResult = result.data;
        if (this.view.status === 'initializing') {
          this.syncFnInInitializingStage.push(() => dataSetter.set(this.view, result.data));
        } else {
          dataSetter.set(this.view, result.data);
        }

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
    this.stopStatusChangeListener();
  }
}
