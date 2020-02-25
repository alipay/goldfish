import * as React from 'react';
import { call, getCurrent } from '@goldfishjs/reactive';
import ComponentSetup from './ComponentSetup';
import ComponentSetupManager from './ComponentSetupManager';

const setupManager = new ComponentSetupManager();

export interface ISetupFunction<R extends Record<string, any>> {
  (): R;
}

export default function observer<
  P,
  SR extends Record<string, any>,
  T extends React.FunctionComponent<P>
>(
  componentFn: T,
): T;
export default function observer<
  P,
  SR extends Record<string, any>,
  T extends React.FunctionComponent<P>
>(
  componentFn: (
    setupResult: SR,
    props: Parameters<T>[0],
    context?: Parameters<T>[1],
  ) => ReturnType<T>,
  setupFn: ISetupFunction<SR>,
): T;
export default function observer<
  P,
  SR extends Record<string, any>,
  T extends React.FunctionComponent<P>
>(
  componentFn: Function,
  setupFn?: ISetupFunction<SR>,
): T {
  const fn = (props: P, context?: any) => {
    // Note: The re-render should always be triggered by `setCounter`.
    const [counter, setCounter] = React.useState(0);
    const [id] = React.useState(counter === 0 ? setupManager.genId() : '');

    // The first time.
    if (counter === 0) {
      const setup = new ComponentSetup();
      setupManager.add(id, setup);
      if (setupFn) {
        setup.setupFnResult = setup.wrap(setupFn);
      }
    }

    let result: React.ReactElement | null = null;
    // Record the reactive data dependencies and listen to the change.
    call(
      () => {
        const setup = setupManager.get(id);
        setup.removeAllStopList();
        result = setup.setupFnResult
          ? componentFn(setup.setupFnResult, props, context)
          : componentFn(props, context);
        // If some data changes, force re-render.
        const list = getCurrent().addChangeListener(
          () => {
            setCounter(counter + 1);
          },
          false,
        );
        setup.setStopList(list);
      },
    );
    return result;
  };
  return fn as T;
}
