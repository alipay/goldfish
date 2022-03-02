import lodash from 'lodash';
import isObject from '@goldfishjs/utils/lib/isObject';

export function timeout(duration: number = 0) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function createPageInstance() {
  const result: any = {
    result: {
      current: null,
      all: [],
    },
  };

  return {
    get data() {
      return result.result.current;
    },
    set data(v) {
      result.result.current = v;
    },
    result,
    query: {},
    $batchedUpdates: (fn: () => void) => {
      return fn();
    },
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

      cb && cb();
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
      cb && cb();
    },
  };
}
