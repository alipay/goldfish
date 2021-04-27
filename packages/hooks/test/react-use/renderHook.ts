import createComponent from '../../src/connector/createComponent';

export interface IRenderHookOptions<S extends Record<string, any>> {
  initialProps: S;
}

export interface IResult {
  result: {
    all: any[];
    current: any;
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
      cb();
    },
  };
  const result = {
    result: {
      all: [],
      current: {},
    },
    rerender: (props?: any) => {
      instance.props = props;
      options.didUpdate?.call(instance, {}, {});
      (instance as any).$$effectContext.executeEffect();
    },
    unmount: () => {
      options.didUnmount?.call(instance);
    },
    waitFor: () => {},
    waitForValueToChange: () => {},
    waitForNextUpdate: () => {},
  };
  options.didMount?.call(instance);
  return result;
}
