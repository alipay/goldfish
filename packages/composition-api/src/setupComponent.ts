import { IProps, attachLogic } from '@goldfishjs/reactive-connect';
import { cloneDeep, uniqueId } from '@goldfishjs/utils';
import observable from '@goldfishjs/reactive/lib/observable';
import isComponent2 from '@goldfishjs/reactive-connect/lib/isComponent2';
import appendFn from './appendFn';
import { ISetupFunction } from './setup/CommonSetup';
import ComponentSetup, { SetupComponentInstance } from './setup/ComponentSetup';
import setupManager from './setup/setupManager';

const lifeCycleMethods: (keyof tinyapp.IComponentLifeCycleMethods<any, any>)[] = [
  'onInit',
  'deriveDataFromProps',
  'didMount',
  'didUpdate',
  'didUnmount',
];

export const COMPONENT_SETUP_ID_KEY = '$$componentSetupId';

export function buildComponentOptions<P extends Record<string, any>, D = any>(
  arg1: P | ISetupFunction,
  arg2?: ISetupFunction,
  isComponent2Param: boolean = isComponent2,
) {
  let props: P | undefined = undefined;
  let fn: ISetupFunction | undefined = undefined;

  if (typeof arg1 === 'function') {
    fn = arg1;
  } else {
    props = arg1;
    fn = arg2;
  }

  let options: tinyapp.ComponentOptions<P, D, {}> = {};
  if (props) {
    options.props = props;
  }

  type View = SetupComponentInstance & { $setup?: ComponentSetup };

  const oldData = options.data;
  // No `this` for the component data function.
  options.data = function () {
    let finalData: Record<string, any> = {};
    if (oldData) {
      finalData = typeof oldData === 'function' ? oldData() : oldData;
    }

    // Create the setup instance.
    const componentSetupId = uniqueId('component-setup-');
    finalData[COMPONENT_SETUP_ID_KEY] = componentSetupId;
    const setup = new ComponentSetup();
    setupManager.add(componentSetupId, setup);

    // Get the default props.
    setup.props = observable(cloneDeep(props) || {});

    // Execute the setup function.
    setup.executeSetupFunction(fn);

    const compositionData = setup.compositionState;
    if (compositionData) {
      finalData =
        typeof finalData === 'object' ? { ...finalData, ...cloneDeep(compositionData) } : cloneDeep(compositionData);
    }

    return finalData;
  } as any;

  const enterKey = isComponent2Param ? 'onInit' : 'didMount';
  attachLogic(options, enterKey, 'before', function (this: View) {
    const setup = setupManager.get(this.data[COMPONENT_SETUP_ID_KEY]) as ComponentSetup | undefined;
    if (!setup) {
      return;
    }

    setup.status = 'ready';

    // Set the component instance.
    setup.setViewInstance(this);

    // Mount the instance methods.
    setup.iterateInstanceMethods((fns, name) => {
      appendFn(this, name, fns as Function[]);
    });

    // Watch the reactive data.
    setup.watchReactiveData();
  });

  // Sync props in lifecyle.
  function defaultSyncHandler(this: View) {
    const setup = setupManager.get(this.data[COMPONENT_SETUP_ID_KEY]) as ComponentSetup | undefined;
    setup?.syncProps(this.props);
  }
  attachLogic(options, 'onInit', 'before', defaultSyncHandler);
  attachLogic(options, 'didMount', 'before', defaultSyncHandler);
  attachLogic(options, 'didUpdate', 'before', defaultSyncHandler);
  attachLogic(options, 'deriveDataFromProps', 'before', function (this: View, nextProps: Record<string, any>) {
    const setup = setupManager.get(this.data[COMPONENT_SETUP_ID_KEY]) as ComponentSetup | undefined;
    setup?.syncProps(nextProps);
  });

  // Mount the lifecycle methods.
  function integrateLifeCycleMethods(lifeCycleMethods: (keyof tinyapp.IComponentLifeCycleMethods<any, any>)[]) {
    return lifeCycleMethods.reduce<tinyapp.ComponentOptions<any>>((prev, cur) => {
      (prev as any)[cur] = function (this: View, ...args: any[]) {
        const setup = setupManager.get(this.data[COMPONENT_SETUP_ID_KEY]);
        if (!setup) {
          return;
        }

        return setup.executeLifeCycleFns(cur, ...args);
      };
      return prev;
    }, {});
  }
  const lifeCycleMethodsOptions = integrateLifeCycleMethods(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  // Destroy
  attachLogic(options, 'didUnmount', 'after', function (this: View) {
    const setup = setupManager.get(this.data[COMPONENT_SETUP_ID_KEY]);
    setup?.destroy();
  });

  return options;
}

export default function setupComponent<P extends IProps, D = Record<string, any>>(
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P, D = Record<string, any>>(
  passInProps: P,
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P extends Record<string, any>, D = any>(
  arg1: P | ISetupFunction,
  arg2?: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}> {
  return buildComponentOptions(arg1, arg2);
}
