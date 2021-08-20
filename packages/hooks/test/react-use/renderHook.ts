import createComponent from '../../src/connector/createComponent';

export interface IRenderHookOptions<S extends Record<string, any>> {
  initialProps: S;
}

export interface IResult {
  result: {
    all: any[];
    current: any;
    error?: any;
  };
  rerender: (props?: any) => void;
  unmount: () => void;
  waitFor: any;
  waitForValueToChange: any;
  waitForNextUpdate: any;
}

export default function renderHook<S>(fn: (props?: S) => any, opts?: IRenderHookOptions<S>): IResult {
  const options = createComponent<S>((props?: S) => {
    return { data: fn(props) };
  });
  const instance = {
    props: opts?.initialProps,
    setData(r: any, cb: () => void) {
      result.result.current = r;
      result.result.all.push(r);
      cb();
    },
  };
  const result: IResult = {
    result: {
      all: [],
      current: {},
      error: {},
    },
    rerender: (props?: any) => {
      instance.props = props;

      try {
        options.didUpdate?.call(instance, {}, {});
      } catch (e) {
        result.result.error = e;
      }

      (instance as any).$$effectContext.executeEffect();
    },
    unmount: () => {
      options.didUnmount?.call(instance);
    },
    waitFor: () => {},
    waitForValueToChange: () => {},
    waitForNextUpdate: () => {},
  };
  try {
    options.didMount?.call(instance);
  } catch (e) {
    result.result.error = e;
  }
  return result;
}
