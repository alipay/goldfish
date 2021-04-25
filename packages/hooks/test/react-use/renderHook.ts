import createComponent from '../../src/connector/createComponent';

export interface IRenderHookOptions<S extends Record<string, any>> {
  initialProps: S;
}

export default function renderHook<S>(fn: (props?: S) => any, opts?: IRenderHookOptions<S>) {
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
  const result: any = {
    result: {
      current: null,
    },
    rerender: (props?: any) => {
      options.didUpdate?.call({ ...instance, props }, {}, {});
      (instance as any).$$effectContext.executeEffect();
    },
  };
  options.didMount?.call(instance);
  return result;
}
