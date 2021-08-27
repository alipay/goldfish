import create, { CreateFunction, IHostInstance } from './create';
import isFunction from '../common/isFunction';
import { OptionsEventName } from '../context/PageEventContext';

export default function createPage(fn: () => ReturnType<CreateFunction>): tinyapp.PageOptions {
  const options: tinyapp.PageOptions = {};
  const hooksOptions = create(fn, 'page');

  type PageInstance = IHostInstance<undefined> &
    tinyapp.IPageInstance<any> &
    Pick<tinyapp.IPageOptionsMethods, 'onShareAppMessage'>;

  const oldOnLoad = options.onLoad;
  options.onLoad = function (this: PageInstance, query) {
    hooksOptions.init.call(this);

    if (this.$$pageEventContext?.hasEventCallback('onShareAppMessage')) {
      const oldOnShareAppMessage = this.onShareAppMessage;
      this.onShareAppMessage = function (this: PageInstance, options) {
        if (isFunction(oldOnShareAppMessage)) {
          oldOnShareAppMessage.call(this, options);
        }

        return this.$$pageEventContext?.call('onShareAppMessage', this, options);
      };
    }

    if (isFunction(oldOnLoad)) {
      oldOnLoad.call(this, query);
    }
  };

  const oldOnReady = options.onReady;
  options.onReady = function (this: PageInstance) {
    if (isFunction(oldOnReady)) {
      oldOnReady.call(this);
    }

    hooksOptions.mounted.call(this);
  };

  const oldOnUnload = options.onUnload;
  options.onUnload = function (this: PageInstance) {
    hooksOptions.unmounted.call(this);

    if (isFunction(oldOnUnload)) {
      oldOnUnload.call(this);
    }
  };

  // 触发事件
  const optionsEventNameList: OptionsEventName[] = [
    'onLoad',
    'onShow',
    'onReady',
    'onHide',
    'onUnload',
    'onPageScroll',
    'onReachBottom',
  ];
  optionsEventNameList.forEach(name => {
    const oldFn = options[name];
    options[name] = function (this: PageInstance, ...args: any[]) {
      if (isFunction(oldFn)) {
        (oldFn as any).call(this, ...args);
      }

      this.$$pageEventContext?.call(name, this, ...args);
    } as any;
  });

  const eventNameList: (keyof tinyapp.IPageEvents)[] = [
    'onBack',
    'onKeyboardHeight',
    'onOptionMenuClick',
    'onPopMenuClick',
    'onPullIntercept',
    'onPullDownRefresh',
    'onTitleClick',
    'onTabItemTap',
    'beforeTabItemTap',
  ];
  const events = options.events || {};
  eventNameList.forEach(name => {
    const oldFn = events[name];
    events[name] = function (this: PageInstance, ...args: any[]) {
      if (isFunction(oldFn)) {
        (oldFn as any).call(this, ...args);
      }

      this.$$pageEventContext?.call(name, this, ...args);
    } as any;
  });
  options.events = events;

  return options;
}
