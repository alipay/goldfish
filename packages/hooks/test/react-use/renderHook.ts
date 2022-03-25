import lodash from 'lodash';
import isObject from '@goldfishjs/utils/lib/isObject';
import createComponent, { COMPONENT_COMPANION_OBJECT_ID_KEY } from '../../src/connector/createComponent';
import { createDefaultInstance } from '../utils';
import companionObjectManager from '../../src/connector/companionObjectManager';

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

function cloneDeep(obj: any) {
  return lodash.cloneDeepWith(obj, v => {
    if (typeof v === 'function') {
      return v;
    }
  });
}

export default function renderHook<S>(fn: (props?: S) => any, opts?: IRenderHookOptions<S>): IResult {
  const initialProps = opts?.initialProps;
  const createFn = (props?: S) => {
    return { data: { hookData: fn(props) } };
  };
  const options = initialProps ? createComponent<S>(initialProps, createFn) : createComponent<S>(createFn);

  const result: IResult = {
    result: {
      all: [],
      current: {},
      error: {},
    },
    rerender: (props?: any) => {
      const prevProps = instance.props;
      instance.props = props;

      try {
        options.didUpdate?.call(instance, prevProps!, instance.data);
      } catch (e) {
        result.result.error = e;
      }

      const companionObject = companionObjectManager.get(instance.data[COMPONENT_COMPANION_OBJECT_ID_KEY]);
      if (companionObject) {
        companionObject.effectContext?.executeEffect();
      }
    },
    unmount: () => {
      options.didUnmount?.call(instance);
    },
    waitFor: () => {},
    waitForValueToChange: () => {},
    waitForNextUpdate: () => {},
  };

  const instance = {
    ...createDefaultInstance(),
    props: options.props,
    setData(r: any, cb: () => void) {
      if (isObject(r) && isObject(instance.data) && !Array.isArray(r)) {
        for (const key in r) {
          lodash.set(instance.data, key, cloneDeep(r[key]));
        }
      } else if (isObject(r) && Object.prototype.hasOwnProperty.call(r, '')) {
        instance.data = r[''];
      } else {
        instance.data = cloneDeep(r);
      }
      result.result.all.push(instance.data.hookData);
      result.result.current = instance.data.hookData;

      cb();
    },
    $spliceData(params: Record<string, [number, number, ...any[]]>, cb: () => void) {
      for (const key in params) {
        const data = key === '' ? instance.data : lodash.get(instance.data, key);
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
      result.result.all.push(instance.data.hookData);
      result.result.current = instance.data.hookData;
      cb();
    },
  };

  let data: Record<string, any> = {};
  Object.defineProperty(instance, 'data', {
    get() {
      return data;
    },
    set(v) {
      data = v;
      result.result.current = data.hookData;
    },
  });

  try {
    instance.data = options.data.call();
    options.didMount?.call(instance);
  } catch (e) {
    result.result.error = e;
  }
  return result;
}
