import { observable, IProps, state, ComponentInstance } from '@goldfishjs/reactive-connect';
import appendFn from './appendFn';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import ComponentSetup from './setup/ComponentSetup';
import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import { AppStore, createComponent, ComponentStore } from '@goldfishjs/core';

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

  const options = {
    props,
    ...integrateLifeCycleMethods<'component'>(lifeCycleMethods),
  };

  type View = ComponentInstance<P, D, BizComponentStore, {}> & { $setup?: ComponentSetup };
  let view: View;

  @observable
  class BizComponentStore extends ComponentStore<P, AppStore> {
    @state
    props = props;

    public constructor() {
      super();

      if (!fn) {
        throw new Error('Please pass in the setup Function.');
      }

      const setup = view.$setup!;
      setup.wrap(() => {
        integrateSetupFunctionResult<'component'>(fn, setup, view, this);
      });
    }
  }

  return createComponent<AppStore, BizComponentStore, P, D>(
    BizComponentStore,
    options,
    {
      beforeCreateStore: (v: View) => {
        const setup = new ComponentSetup();
        v.$setup = setup;
        view = v;

        setup.iterateMethods((fns, name) => {
          appendFn(v, name, fns);
        });
      },
    },
  );
}
