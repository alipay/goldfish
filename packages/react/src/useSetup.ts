import { ReactLike, ISetupFunction } from './observer';
import { call, getCurrent, observable } from '@goldfishjs/reactive';
import { isObject, cloneDeep } from '@goldfishjs/utils';
import { setupManager } from './ComponentSetupManager';
import ComponentSetup from './ComponentSetup';

export default function useSetup<SR extends Record<string, any>>(
  reactLike: ReactLike,
  setupFn: ISetupFunction<SR>,
  props?: any,
) {
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
      setup.props = observable(cloneDeep(props || {}));
      setup.setupFnResult = setup.wrap(setupFn);
    }
  }

  const setup = setupManager.get(id);

  // Sync props.
  reactLike.useMemo(() => {
    // If there is no setup function, then the props sync is useless.
    if (!setupFn) {
      return;
    }

    if (isObject(props)) {
      for (const key in props) {
        if (!(key in setup.props)) {
          console.warn(`The key: ${key} will not be reactive, because it is not declared in initial props.`);
        }

        if (props[key] !== setup.props[key]) {
          setup.props[key] = props[key];
        }
      }
    }
  }, [props]);

  // Fetch init data.
  reactLike.useEffect(() => {
    setup.initData.init();
  }, []);

  // Destroy & Init
  reactLike.useEffect(() => {
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

  setup.removeAllStopList();
  const g = reactLike.useCallback(
    <R>(fn: (data: SR) => R): R => {
      let result: any;
      call(() => {
        result = fn(setup.setupFnResult);
        const list = getCurrent().addChangeListener(() => {
          setCounter(counter + 1);
        }, false);
        setup.addStopList(list);
      });
      return result;
    },
    [counter],
  );

  type SRFns = Pick<
    SR,
    {
      [P in keyof SR]: SR[P] extends Function ? P : never;
    }[keyof SR]
  >;
  const fns = reactLike.useRef<any>(
    counter === 0
      ? Object.keys(setup.setupFnResult).reduce<any>((prev, key) => {
          const val = setup.setupFnResult[key];
          if (typeof val === 'function') {
            prev[key] = val;
          }
          return prev;
        }, {})
      : {},
  );

  return {
    g,
    connect: g,
    ...(fns.current as SRFns),
  };
}
