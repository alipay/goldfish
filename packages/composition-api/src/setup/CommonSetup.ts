import {
  watch as baseWatch,
  IWatchExpressionFn,
  IWatchCallback,
  IWatchOptions,
  autorun as baseAutorun,
  AutorunFunction,
  IErrorCallback,
  DepList,
  watchDeep,
} from '@goldfishjs/reactive';
import { getMiniDataSetter } from '@goldfishjs/reactive-connect';
import Setup from './Setup';
import reactive from '../reactive';

export type UnAutorun = (() => void) & {
  depList?: DepList | undefined;
};

export interface ISetupFunction {
  (): Record<string, any>;
}

export type Status = 'initializing' | 'ready' | 'destroyed';

export default class CommonSetup<M, V> extends Setup {
  private fetchInitDataMethod?: () => Promise<void>;

  private viewInstance?: V;

  // The lifecycle methods.
  private methods: { [K in keyof M]?: M[K][] } = {};

  // The custom instance methods.
  private instanceMethods: Record<string, Function[]> = {};

  private _status: Status = 'initializing';

  private syncFnInInitializingStage: (() => void)[] = [];

  public get status() {
    return this._status;
  }

  public set status(v: Status) {
    this._status = v;
    this.syncFnInInitializingStage.forEach(fn => fn());
    this.syncFnInInitializingStage = [];
  }

  public stopWatchDeepList: (() => void)[] = [];

  // The reactive data.
  public compositionState: Record<string, any> = {};

  public stopWatchList: (() => void)[] = [];

  public stopAutorunList: (() => void)[] = [];

  public autorun(fn: AutorunFunction, errorCb?: IErrorCallback): UnAutorun {
    const stop = baseAutorun(fn, errorCb);
    this.stopAutorunList.push(stop);
    return stop;
  }

  public watch<R>(fn: IWatchExpressionFn<R>, cb: IWatchCallback<R>, options?: IWatchOptions) {
    const stop = baseWatch(fn, cb, options);
    this.stopWatchList.push(stop);
    return stop;
  }

  public setViewInstance(val: V) {
    this.viewInstance = val;
  }

  public getViewInstance() {
    return this.viewInstance;
  }

  public addFetchInitDataMethod(fn: () => Promise<void>, isAsync = true) {
    const fetchInitDataMethod = this.fetchInitDataMethod;
    if (fetchInitDataMethod) {
      this.fetchInitDataMethod = isAsync
        ? async function (this: any) {
            await Promise.all([fetchInitDataMethod.call(this), fn.call(this)]);
          }
        : async function (this: any) {
            await fetchInitDataMethod.call(this);
            await fn.call(this);
          };
    } else {
      this.fetchInitDataMethod = fn;
    }
  }

  public getFetchInitDataMethod() {
    return this.fetchInitDataMethod;
  }

  public addMethod<N extends keyof M>(name: N, fn: M[N]) {
    this.add(this.methods, name as string, fn);
  }

  public getMethod<N extends keyof M>(name: N) {
    return this.methods[name];
  }

  public iterateMethods(cb: <N extends keyof M>(fns: M[N][], name: N) => void) {
    for (const k in this.methods) {
      const methodFns = this.methods[k]!;
      cb(methodFns, k);
    }
  }

  public addInstanceMethod(name: string, fn: Function) {
    if (name === 'onShareAppMessage') {
      const onShareAppMessageFns = this.getInstanceMethod('onShareAppMessage');
      if (!onShareAppMessageFns || !onShareAppMessageFns.length) {
        this.add(this.instanceMethods, name as string, fn);
      } else {
        const oldOnShareAppMessage = onShareAppMessageFns[onShareAppMessageFns.length - 1];
        onShareAppMessageFns[onShareAppMessageFns.length - 1] = function (this: any, options: any) {
          const previousResult = oldOnShareAppMessage.call(this, options);
          return {
            ...previousResult,
            ...(fn as any).call(this, options),
          };
        };
      }
    } else {
      this.add(this.instanceMethods, name as string, fn);
    }
  }

  public getInstanceMethod(name: string) {
    return this.instanceMethods[name];
  }

  public iterateInstanceMethods(cb: (fns: Function[], name: string) => void) {
    for (const k in this.instanceMethods) {
      const methodFns = this.instanceMethods[k];
      cb(methodFns, k);
    }
  }

  public executeSetupFunction(fn?: ISetupFunction) {
    this.wrap(() => {
      if (!fn) {
        throw new Error('Please pass in the setup Function.');
      }

      let config: Record<string, any> = {};
      config = fn();

      const compositionState: Record<string, any> = {
        isInitLoading: true,
      };
      for (const k in config) {
        const value = config[k];
        if (typeof value === 'function') {
          this.addInstanceMethod(k, value);
        } else {
          Object.defineProperty(compositionState, k, {
            configurable: true,
            enumerable: true,
            get() {
              return config[k];
            },
            set(v: any) {
              config[k] = v;
            },
          });
        }
      }
      // Convert the returned data to reactive one.
      const reactiveCompositionState = reactive(compositionState);
      this.compositionState = reactiveCompositionState;
    });
  }

  public executeLifeCycleFns(lifeCycleName: string, ...args: any[]) {
    const fns: Function[] = (this.getMethod as any)(lifeCycleName) || [];
    let result: any;
    for (const i in fns) {
      const fn = fns[i];
      result = (fn as Function).call(this.viewInstance, ...args);
    }
    return result;
  }

  public watchReactiveData() {
    const compositionState = this.compositionState;
    if (compositionState) {
      const stopList: (() => void)[] = [];
      stopList.push(
        watchDeep(
          compositionState,
          (obj: any, keyPathList, newV, oldV, options) => {
            const miniDataSetter = getMiniDataSetter();
            if (this.status === 'initializing') {
              this.syncFnInInitializingStage.push(() => {
                miniDataSetter.set(this.viewInstance as any, obj, keyPathList, newV, oldV, options);
              });
            } else if (this.status === 'ready') {
              miniDataSetter.set(this.viewInstance as any, obj, keyPathList, newV, oldV, options);
            }
          },
          {
            immediate: false,
          },
        ),
      );
      this.stopWatchDeepList = stopList;
    }
  }

  public destroy() {
    this.status = 'destroyed';
    this.fetchInitDataMethod = undefined;
    this.viewInstance = undefined;
    this.methods = {};
    this.instanceMethods = {};

    this.stopWatchDeepList.forEach(stop => stop());
    this.stopWatchDeepList = [];

    this.compositionState = {};

    this.stopWatchList.forEach(stop => stop());
    this.stopAutorunList.forEach(stop => stop());
    this.stopWatchList = [];
    this.stopAutorunList = [];
  }
}
