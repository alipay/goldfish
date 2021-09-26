import lodash from 'lodash';
import isObject from '@goldfishjs/utils/lib/isObject';
import createComponent from '../../src/connector/createComponent';
import { createDefaultInstance } from '../utils';

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
    ...createDefaultInstance(),
    props: opts?.initialProps,
    setData(r: any, cb: () => void) {
      if (isObject(r) && isObject(result.result.current) && !Array.isArray(r)) {
        for (const key in r) {
          lodash.set(result.result.current, key, r[key]);
        }
      } else if (isObject(r) && Object.prototype.hasOwnProperty.call(r, '')) {
        result.result.current = r[''];
      } else {
        result.result.current = lodash.cloneDeep(r);
      }
      result.result.all.push(result.result.current);

      cb();
    },
    $spliceData(params: Record<string, [number, number, ...any[]]>, cb: () => void) {
      for (const key in params) {
        const data = key === '' ? result.result.current : lodash.get(result.result.current, key);
        const start = params[key][0];
        const deleteCount = params[key][1];
        const values = params[key].slice(2);
        if (start > data.length) {
          for (let i = 0, il = values.length; i < il; i++) {
            data[i + start] = values[i];
          }
        } else {
          data.splice(start, deleteCount, ...values);
        }
      }
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
