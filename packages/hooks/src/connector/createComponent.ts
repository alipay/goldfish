import { cloneDeep, uniqueId } from '@goldfishjs/utils';
import create, { CreateFunction } from './create';
import isFunction from '../common/isFunction';
import companionObjectManager from './companionObjectManager';
import { PAGE_COMPONION_OBJECT_ID_KEY } from './createPage';

export const isComponent2 = typeof my !== 'undefined' && !!my?.canIUse('component2');

export const COMPONENT_COMPaNION_OBJECT_ID_KEY = '$$companentCompanionObjectId';

const componentNotReadyError = new Error('The component is not ready.');

interface ICreateFunction<P> {
  (props: P): ReturnType<CreateFunction>;
}

export default function createComponent<P>(fn: ICreateFunction<P>): tinyapp.ComponentOptions;
export default function createComponent<P>(props: Partial<P>, fn: ICreateFunction<P>): tinyapp.ComponentOptions;
export default function createComponent<P>(arg1: any, arg2?: any): tinyapp.ComponentOptions {
  let props: P = undefined as any;
  let fn: ICreateFunction<P>;

  if (typeof arg1 === 'function') {
    fn = arg1;
  } else {
    props = arg1;
    fn = arg2;
  }

  const options: tinyapp.ComponentOptions = {};
  const hooksOptions = create<P>(fn, 'component');

  type ComponentInstance = tinyapp.IComponentInstance<P, any>;

  const oldData = options.data;
  // No `this` for the component data function.
  options.data = function () {
    let finalData: Record<string, any> = {};
    if (oldData) {
      finalData = typeof oldData === 'function' ? oldData() : oldData;
    }

    // Create the companion object.
    const companentCompanionObjectId = uniqueId('component-companion-object-');
    finalData[COMPONENT_COMPaNION_OBJECT_ID_KEY] = companentCompanionObjectId;
    const companionObject = companionObjectManager.create({
      setData() {
        throw componentNotReadyError;
      },
      spliceData() {
        throw componentNotReadyError;
      },
      batchedUpdates() {
        throw componentNotReadyError;
      },
    });
    companionObjectManager.add(companentCompanionObjectId, companionObject);

    // Get the default props.
    companionObject.props = props && cloneDeep(props);

    // Initialize
    hooksOptions.init.call(companionObject);

    if (companionObject.renderDataResult) {
      finalData =
        typeof finalData === 'object'
          ? { ...finalData, ...cloneDeep(companionObject.renderDataResult) }
          : cloneDeep(companionObject.renderDataResult);
    }

    return finalData;
  };

  const initMethod = isComponent2 ? 'onInit' : 'didMount';
  const oldInitMethod = options[initMethod];
  options[initMethod] = function (this: ComponentInstance) {
    const companionObject = companionObjectManager.get(this.data[COMPONENT_COMPaNION_OBJECT_ID_KEY]);
    if (companionObject) {
      Object.assign(companionObject, {
        setData: this.setData.bind(this),
        spliceData: this.$spliceData.bind(this),
        batchedUpdates: this.$page.$batchedUpdates.bind(this.$page),
      });

      const pageCompanionObject = companionObjectManager.get(this.$page.data[PAGE_COMPONION_OBJECT_ID_KEY]);
      if (pageCompanionObject) {
        companionObject.query = pageCompanionObject.query;
      }

      companionObject.status = 'ready';
    }

    if (isFunction(oldInitMethod)) {
      oldInitMethod.call(this);
    }
  };

  const oldDidMount = options.didMount;
  options.didMount = function (this: ComponentInstance) {
    if (isFunction(oldDidMount)) {
      oldDidMount.call(this);
    }

    const companionObject = companionObjectManager.get(this.data[COMPONENT_COMPaNION_OBJECT_ID_KEY]);
    if (companionObject) {
      hooksOptions.mounted.call(companionObject);
    }
  };

  const oldUnmount = options.didUnmount;
  options.didUnmount = function (this: ComponentInstance) {
    const companionObject = companionObjectManager.get(this.data[COMPONENT_COMPaNION_OBJECT_ID_KEY]);
    if (companionObject) {
      hooksOptions.unmounted.call(companionObject);
    }

    if (isFunction(oldUnmount)) {
      oldUnmount.call(this);
    }
  };

  const syncPropsMethod = isComponent2 ? 'deriveDataFromProps' : 'didUpdate';
  const oldSyncPropsMethod = options[syncPropsMethod];
  options[syncPropsMethod] = function (this: ComponentInstance, nextProps: any) {
    const companionObject = companionObjectManager.get(this.data[COMPONENT_COMPaNION_OBJECT_ID_KEY]);
    if (companionObject) {
      hooksOptions.syncProps.call(companionObject, isComponent2 ? nextProps : this.props);
    }

    if (isFunction(oldSyncPropsMethod)) {
      (oldSyncPropsMethod as any).call(this, nextProps);
    }
  };

  const oldDidUpdateMethod = options.didUpdate;
  options.didUpdate = function (this: ComponentInstance, prevProps: Partial<{}>, prevData: Partial<{}>) {
    const companionObject = companionObjectManager.get(this.data[COMPONENT_COMPaNION_OBJECT_ID_KEY]);
    if (companionObject) {
      if (prevProps !== this.props) {
        hooksOptions.executeEffect.call(companionObject);
      }
    }

    if (isFunction(oldDidUpdateMethod)) {
      oldDidUpdateMethod.call(this, prevProps, prevData);
    }
  };

  return options;
}
