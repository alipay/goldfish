import { observable, IProps, state, attachLogic } from '@goldfishjs/reactive-connect';
import appendFn from './appendFn';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import ComponentSetup, { SetupComponentInstance } from './setup/ComponentSetup';
import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import { AppStore, createComponent, ComponentStore } from '@goldfishjs/core';
import { cloneDeep } from '@goldfishjs/utils';

const lifeCycleMethods: (keyof tinyapp.IComponentLifeCycleMethods<any, any>)[] = [
  'onInit',
  'deriveDataFromProps',
  'didMount',
  'didUpdate',
  'didUnmount',
];

export default function setupComponent<P extends IProps, D = any>(
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P, D = any>(
  passInProps: Partial<P>,
  passInFn: ISetupFunction,
): tinyapp.ComponentOptions<P, D, {}>;
export default function setupComponent<P extends Record<string, any>, D = any>(
  passInProps: P | ISetupFunction,
  passInFn?: ISetupFunction,
) {
  const props: P = typeof passInProps === 'object' ? passInProps : {} as P;
  const fn = (
    typeof passInProps === 'function'
      ? passInProps : passInFn
  ) as ISetupFunction;

  let options: tinyapp.ComponentOptions<P, D, {}> = {
    props,
  };

  type View = SetupComponentInstance & { $setup?: ComponentSetup };
  let view: View;

  @observable
  class BizComponentStore extends ComponentStore<any, AppStore> {
    @state
    props = cloneDeep(props);

    private stopWatchDeepList: (() => void)[] = [];

    public constructor() {
      super();

      if (!fn) {
        throw new Error('Please pass in the setup Function.');
      }

      const setup = view.$setup!;
      setup.wrap(() => {
        this.stopWatchDeepList = integrateSetupFunctionResult<'component'>(fn, setup, view, this);
      });
    }

    public destroy() {
      super.destroy();
      this.stopWatchDeepList.forEach(stop => stop());
      this.stopWatchDeepList = [];
    }
  }

  options = createComponent<AppStore, BizComponentStore, P, D>(
    BizComponentStore,
    options,
    {
      beforeCreateStore: (v: View) => {
        const setup = new ComponentSetup();
        v.$setup = setup;
        view = v;

        setup.iterateMethods((fns, name) => {
          appendFn(v, name, fns as Function[]);
        });
      },
    },
  );

  const lifeCycleMethodsOptions = integrateLifeCycleMethods<'component'>(lifeCycleMethods);
  lifeCycleMethods.forEach((m) => {
    attachLogic(options, m, 'after', lifeCycleMethodsOptions[m] as any);
  });

  return options;
}
