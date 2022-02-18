import { IProps, attachLogic } from '@goldfishjs/reactive-connect';
import { AppStore, createComponent, ComponentStore } from '@goldfishjs/core';
import { cloneDeep } from '@goldfishjs/utils';
import observable from '@goldfishjs/reactive/lib/observable';
import appendFn from './appendFn';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import ComponentSetup, { SetupComponentInstance } from './setup/ComponentSetup';
import integrateLifeCycleMethods from './integrateLifeCycleMethods';

const lifeCycleMethods: (keyof tinyapp.IComponentLifeCycleMethods<any, any>)[] = [
  'onInit',
  'deriveDataFromProps',
  'didMount',
  'didUpdate',
  'didUnmount',
];

export default function setupComponent<P extends IProps, D = Record<string, any>>(
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P, D = Record<string, any>>(
  passInProps: P,
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P, D = Record<string, any>>(
  passInProps: P,
  dftData: Partial<D>,
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P extends Record<string, any>, D = any>(
  arg1: P | ISetupFunction,
  arg2?: Partial<D> | ISetupFunction,
  arg3?: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}> {
  let props: P | undefined = undefined;
  let dftData: D | undefined = undefined;
  let fn: ISetupFunction | undefined = undefined;

  if (typeof arg3 === 'function') {
    props = arg1 as P;
    dftData = arg2 as D;
    fn = arg3 as ISetupFunction;
  } else if (typeof arg2 === 'function') {
    props = arg1 as P;
    fn = arg2 as ISetupFunction;
  } else if (typeof arg1 === 'function') {
    fn = arg1 as ISetupFunction;
  }

  let options: tinyapp.ComponentOptions<P, D, {}> = {};
  if (props) {
    options.props = props;
  }
  if (dftData) {
    options.data = dftData;
  }

  type View = SetupComponentInstance & { $setup?: ComponentSetup };
  let view: View;

  class BizComponentStore extends ComponentStore<any, AppStore> {
    props = observable(cloneDeep(props) || {}) as P;

    private stopWatchDeepList: (() => void)[] = [];

    public constructor() {
      super();

      if (!fn) {
        throw new Error('Please pass in the setup Function.');
      }

      const setup = view.$setup!;
      setup.wrap(() => {
        this.stopWatchDeepList = integrateSetupFunctionResult<'component'>(fn!, setup, view, this);
      });
    }

    public destroy() {
      super.destroy();
      this.stopWatchDeepList.forEach(stop => stop());
      this.stopWatchDeepList = [];
    }
  }

  options = createComponent<AppStore, BizComponentStore, P, D>(BizComponentStore, options, {
    beforeCreateStore: (v: View) => {
      const setup = new ComponentSetup();
      v.$setup = setup;
      view = v;

      setup.iterateMethods((fns, name) => {
        appendFn(v, name, fns as Function[]);
      });
    },
  }) as any;

  const lifeCycleMethodsOptions = integrateLifeCycleMethods<'component'>(lifeCycleMethods);
  lifeCycleMethods.forEach(m => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  return options;
}
