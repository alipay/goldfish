import { uniqueId, cloneDeep } from '@goldfishjs/utils';
import create, { CreateFunction } from './create';
import isFunction from '../common/isFunction';
import { OptionsEventName } from '../context/PageEventContext';
import companionObjectManager from './companionObjectManager';

export const PAGE_COMPONION_OBJECT_ID_KEY = '$$pageComponionObjectId';

export default function createPage(fn: () => ReturnType<CreateFunction>): tinyapp.PageOptions {
  const options: tinyapp.PageOptions = {};
  const hooksOptions = create(fn, 'page');

  type PageInstance = tinyapp.IPageInstance<any> & Pick<tinyapp.IPageOptionsMethods, 'onShareAppMessage'>;

  const oldData = options.data;
  options.data = function (this: PageInstance) {
    let finalData: Record<string, any> = {};
    if (oldData) {
      finalData = typeof oldData === 'function' ? oldData.call(this) : oldData;
    }

    // Create the componion object.
    const pageComponionObjectId = uniqueId('page-componion-object-');
    finalData[PAGE_COMPONION_OBJECT_ID_KEY] = pageComponionObjectId;
    const companionObject = companionObjectManager.create({
      setData: this.setData.bind(this),
      spliceData: this.$spliceData.bind(this),
      batchedUpdates: this.$batchedUpdates.bind(this),
    });
    companionObjectManager.add(pageComponionObjectId, companionObject);

    // Initialize
    hooksOptions.init.call(companionObject);

    // Check the onShareAppMessage
    if (companionObject.pageEventContext?.hasEventCallback('onShareAppMessage')) {
      const oldOnShareAppMessage = this.onShareAppMessage;
      this.onShareAppMessage = function (this: PageInstance, options) {
        const previousResult = isFunction(oldOnShareAppMessage) ? oldOnShareAppMessage.call(this, options) : {};
        return {
          ...previousResult,
          ...companionObject.pageEventContext?.call('onShareAppMessage', this, options),
        };
      };
    }

    if (companionObject.renderDataResult) {
      finalData =
        typeof finalData === 'object'
          ? { ...finalData, ...cloneDeep(companionObject.renderDataResult) }
          : cloneDeep(companionObject.renderDataResult);
    }

    return finalData;
  };

  const oldOnLoad = options.onLoad;
  options.onLoad = function (this: PageInstance, query) {
    const companionObject = companionObjectManager.get(this.data[PAGE_COMPONION_OBJECT_ID_KEY]);
    if (!companionObject) {
      return;
    }

    companionObject.query = query;
    companionObject.status = 'ready';

    if (isFunction(oldOnLoad)) {
      oldOnLoad.call(this, query);
    }
  };

  const oldOnReady = options.onReady;
  options.onReady = function (this: PageInstance) {
    if (isFunction(oldOnReady)) {
      oldOnReady.call(this);
    }

    const companionObject = companionObjectManager.get(this.data[PAGE_COMPONION_OBJECT_ID_KEY]);
    if (companionObject) {
      hooksOptions.mounted.call(companionObject);
    }
  };

  const oldOnUnload = options.onUnload;
  options.onUnload = function (this: PageInstance) {
    const companionObject = companionObjectManager.get(this.data[PAGE_COMPONION_OBJECT_ID_KEY]);
    if (companionObject) {
      hooksOptions.unmounted.call(companionObject);
      companionObject.status = 'destroyed';
      companionObjectManager.remove(this.data[PAGE_COMPONION_OBJECT_ID_KEY]);
    }

    if (isFunction(oldOnUnload)) {
      oldOnUnload.call(this);
    }
  };

  // Lifecycle
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

      const companionObject = companionObjectManager.get(this.data[PAGE_COMPONION_OBJECT_ID_KEY]);
      if (companionObject) {
        companionObject.pageEventContext?.call(name, this, ...args);
      }
    } as any;
  });

  // Events
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

      const companionObject = companionObjectManager.get(this.data[PAGE_COMPONION_OBJECT_ID_KEY]);
      if (companionObject) {
        companionObject.pageEventContext?.call(name, this, ...args);
      }
    } as any;
  });
  options.events = events;

  return options;
}
