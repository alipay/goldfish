import * as React from 'react';
import { call, getCurrent, observable } from '@goldfishjs/reactive';
import { isObject, cloneDeep } from '@goldfishjs/utils';
import ComponentSetup from './ComponentSetup';
import { setupManager } from './ComponentSetupManager';

export interface ISetupFunction<R extends Record<string, any>> {
  (): R;
}

export type ReactLike = Pick<typeof React, 'useState' | 'useMemo' | 'useEffect' | 'useRef' | 'useCallback'>;

export default function observer<P, T extends React.FunctionComponent<P> = React.FunctionComponent<P>>(
  reactLike: ReactLike,
  componentFn: T,
): T;
export default function observer<P, T extends React.FunctionComponent<P> = React.FunctionComponent<P>>(
  reactLike: ReactLike,
  defaultProps: P,
  componentFn: T,
): T;
export default function observer<
  P,
  SR extends Record<string, any> = Record<string, any>,
  T extends React.FunctionComponent<P> = React.FunctionComponent<P>,
>(
  reactLike: ReactLike,
  componentFn: (setupResult: SR, props: Parameters<T>[0], context?: Parameters<T>[1]) => ReturnType<T>,
  setupFn: ISetupFunction<SR>,
): T;
export default function observer<
  P,
  SR extends Record<string, any> = Record<string, any>,
  T extends React.FunctionComponent<P> = React.FunctionComponent<P>,
>(
  reactLike: ReactLike,
  defaultProps: P,
  componentFn: (setupResult: SR, props: Parameters<T>[0], context?: Parameters<T>[1]) => ReturnType<T>,
  setupFn: ISetupFunction<SR>,
): T;

export default function observer<P, SR extends Record<string, any>, T extends React.FunctionComponent<P>>(
  reactLike: ReactLike,
  passInDefaultProps: P | T | ((setupResult: SR, props: Parameters<T>[0], context?: Parameters<T>[1]) => ReturnType<T>),
  passInComponentFn?:
    | T
    | ISetupFunction<SR>
    | ((setupResult: SR, props: Parameters<T>[0], context?: Parameters<T>[1]) => ReturnType<T>),
  passInSetupFn?: ISetupFunction<SR>,
): T {
  let defaultProps: any = {};
  let componentFn: Function;
  let setupFn: ISetupFunction<SR> | undefined = undefined;
  if (!passInComponentFn && !passInSetupFn) {
    componentFn = passInDefaultProps as Function;
  } else if (!passInSetupFn) {
    defaultProps = typeof passInDefaultProps === 'function' ? {} : passInDefaultProps;
    componentFn = (typeof passInDefaultProps === 'function' ? passInDefaultProps : passInComponentFn) as Function;
    setupFn = typeof passInDefaultProps === 'function' ? (passInComponentFn as ISetupFunction<SR>) : undefined;
  } else {
    defaultProps = passInDefaultProps;
    componentFn = passInComponentFn as Function;
    setupFn = passInSetupFn;
  }

  const fn = function (this: any, props: P, context?: any) {
    // Note: The re-render should always be triggered by `setCounter`.
    const [counter, setCounter] = reactLike.useState(0);
    // The id is used to identity the component instance.
    const [id] = reactLike.useState(counter === 0 ? setupManager.genId() : '');

    // The first time.
    const isFirstTime = reactLike.useRef<boolean>(true);
    if (isFirstTime.current) {
      isFirstTime.current = false;
      const setup = new ComponentSetup();
      setupManager.add(id, setup);
      if (setupFn) {
        // Put the props initialization here,
        // because the `useProps` may be called in the `setupFn`.
        setup.props = observable(cloneDeep(defaultProps));
        setup.setupFnResult = setup.wrap(setupFn);
      }
    }

    // Sync props.
    reactLike.useMemo(() => {
      // If there is no setup function, then the props sync is useless.
      if (!setupFn) {
        return;
      }

      const setup = setupManager.get(id);

      if (isObject(props)) {
        for (const key in props) {
          if (!(key in setup.props)) {
            console.warn(
              `The key: ${key} will not be reactive, because it is not declared in defaultProps: ${JSON.stringify(
                defaultProps,
              )}`,
            );
          }

          if (props[key] !== setup.props[key]) {
            setup.props[key] = props[key];
          }
        }
      }
    }, [props]);

    // Fetch init data.
    reactLike.useEffect(() => {
      const setup = setupManager.get(id);
      setup.initData.init();
    }, []);

    // Destroy & Init
    reactLike.useEffect(() => {
      const setup = setupManager.get(id);
      setup.mountFns.forEach(fn => fn());
      setup.mountFns = [];
      return () => {
        // Remove all listeners.
        setup.removeAllStopList();
        setup.stopAllAutorun();
        setup.stopAllWatch();
        setup.unmountFns.forEach(fn => fn());
        setup.unmountFns = [];
      };
    }, []);

    let result: React.ReactElement | null = null;
    // Record the reactive data dependencies and listen to the change.
    call(() => {
      const setup = setupManager.get(id);
      setup.removeAllStopList();
      result = setup.setupFnResult
        ? componentFn.call(this, setup.setupFnResult, props, context)
        : componentFn.call(this, props, context);
      // If some data changes, force re-render.
      const list = getCurrent().addChangeListener(() => {
        setCounter(counter + 1);
      }, false);
      setup.addStopList(list);
    });
    return result;
  };
  return fn as T;
}
