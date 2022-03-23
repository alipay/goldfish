import qs from 'qs';
import { ISetupFunction, setupPage } from '@goldfishjs/composition-api';
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

export interface IMountPageOptions {
  query?: Record<string, any>;
}

export default function mountPage<D>(fn: ISetupFunction, opts?: IMountPageOptions) {
  const options = setupPage(fn);
  const instance: tinyapp.IPageInstance<D> = {
    data: undefined as any,
    $batchedUpdates(cb: Function) {
      cb();
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
    route: 'pages/index/index',
  };

  (instance as any).data = (options.data as Function).call(instance);
  options.onLoad?.call(instance, (opts?.query ? qs.parse(qs.stringify(opts.query)) : {}) as any);
  options.onReady?.call(instance);

  const stopWatchList: (() => void)[] = [];
  const stopAutorunList: (() => void)[] = [];

  return {
    get data() {
      return instance.data;
    },
    hide() {
      return options.onHide?.call(instance);
    },
    show() {
      return options.onShow?.call(instance);
    },
    unload() {
      const result = options.onUnload?.call(instance);

      stopWatchList.forEach(s => s());
      stopWatchList.splice(0, stopWatchList.length);
      stopAutorunList.forEach(s => s());
      stopAutorunList.splice(0, stopAutorunList.length);
      return result;
    },
    share(params: tinyapp.OnShareAppMessageOptions) {
      return options.onShareAppMessage?.call(instance, params);
    },
    titleClick() {
      return options.onTitleClick?.call(instance);
    },
    pullDownRefresh(params: { from: 'manual' | 'code' }) {
      return options.onPullDownRefresh?.call(instance, params);
    },
    tabItemTap(item: { index: number; pagePath: string; text: string }) {
      return options.onTabItemTap?.call(instance, item);
    },
    pageScroll(event: tinyapp.IPageScrollEvent) {
      return options.onPageScroll?.call(instance, event);
    },
    reachBottom() {
      return options.onReachBottom?.call(instance);
    },
    events: {
      back() {
        return options.events?.onBack?.call(instance);
      },
      keyboardHeight() {
        return options.events?.onKeyboardHeight?.call(instance);
      },
      optionMenuClick() {
        return options.events?.onOptionMenuClick?.call(instance);
      },
      pullDownRefresh(params: { from: 'manual' | 'code' }) {
        return options.events?.onPullDownRefresh?.call(instance, params);
      },
      titleClick() {
        return options.events?.onTitleClick?.call(instance);
      },
      tabItemTap(item: { index: number; pagePath: string; text: string }) {
        return options.events?.onTabItemTap?.call(instance, item);
      },
      beforeTabItemTap() {
        return options.events?.beforeTabItemTap?.call(instance);
      },
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
