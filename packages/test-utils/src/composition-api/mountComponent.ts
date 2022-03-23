import { ISetupFunction } from '@goldfishjs/composition-api';
import { buildComponentOptions } from '@goldfishjs/composition-api/lib/setupComponent';
import { get as keyPathGet } from '@goldfishjs/reactive-connect/lib/MiniDataSetter/keyPath';
import {
  watch as baseWatch,
  autorun as baseAutorun,
  IWatchExpressionFn,
  IWatchCallback,
  IWatchOptions,
  AutorunFunction,
  IErrorCallback,
} from '@goldfishjs/reactive';

export interface IMountComponentOptions<P> {
  propsData?: Partial<P>;
  isComponent2?: boolean;
}

let counter = 0;

export default function mountComponent<P, D>(fn: ISetupFunction, opts?: IMountComponentOptions<P>) {
  const isComponent2 = opts?.isComponent2 === undefined ? true : opts.isComponent2;

  const options = buildComponentOptions(opts?.propsData || {}, fn, isComponent2);
  const instance: tinyapp.IComponentInstance<P, D> = {
    props: undefined as any,
    data: undefined as any,
    $id: counter++,
    is: '',
    $page: {
      data: undefined,
      $batchedUpdates(cb: Function) {
        cb();
      },
      setData() {},
      $spliceData() {},
      route: 'page/index/index',
    },
    setData(obj: Record<string, any>, cb?: () => void) {
      for (const key in obj) {
        const keyPathList = keyPathGet(key);
        keyPathList.reduce((prevData: any, key, index, list) => {
          if (index === list.length - 1) {
            prevData[key] = obj[key];
          }
          return prevData[key];
        }, this.data);
      }
      Promise.resolve().then(cb);
    },
    $spliceData(obj: Record<string, [number, number, ...any[]]>, cb?: () => void) {
      for (const key in obj) {
        const keyPathList = keyPathGet(key);
        keyPathList.reduce((prevData: any, key, index, list) => {
          if (index === list.length - 1) {
            prevData[key].splice(obj[key][0], obj[key][1], ...obj[key].slice(2));
          }
          return prevData[key];
        }, this.data);
      }
      Promise.resolve().then(cb);
    },
  };

  (instance as any).data = (options.data as Function).call(undefined);
  if (isComponent2) {
    options.onInit?.call(instance);
  } else {
    options.didMount?.call(instance);
  }

  const stopWatchList: (() => void)[] = [];
  const stopAutorunList: (() => void)[] = [];

  return {
    get data() {
      return instance.data;
    },
    get props() {
      return instance.props;
    },
    set props(v: Partial<P>) {
      options.deriveDataFromProps?.call(instance, v);

      const prevProps = instance.props;
      (instance as any).props = { ...instance.props, ...v };
      options.didUpdate?.call(instance, prevProps, instance.data);
    },
    unmount() {
      options.didUnmount?.call(instance);

      stopWatchList.forEach(s => s());
      stopWatchList.splice(0, stopWatchList.length);
      stopAutorunList.forEach(s => s());
      stopAutorunList.splice(0, stopAutorunList.length);
    },
    watch<R>(fn: IWatchExpressionFn<R>, cb: IWatchCallback<R>, options?: IWatchOptions) {
      const stop = baseWatch(fn, cb, options);
      stopWatchList.push(stop);
      return stop;
    },
    autorun(fn: AutorunFunction, errorCb?: IErrorCallback) {
      const stop = baseAutorun(fn, errorCb);
      stopAutorunList.push(stop);
      return stop;
    },
  };
}
