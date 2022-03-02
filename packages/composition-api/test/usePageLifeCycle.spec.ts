import lodash from 'lodash';
import isObject from '@goldfishjs/utils/lib/isObject';
import setupPage from '../src/setupPage';
import usePageLifeCycle from '../src/usePageLifeCycle';

function createPageInstance() {
  const result: any = {
    result: {
      current: null,
      all: [],
    },
  };

  return {
    result,
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

it('should have the `onShareAppMessage`.', () => {
  const options = setupPage(() => {
    usePageLifeCycle('onShareAppMessage', () => {
      return { title: 'title', path: 'path' };
    });
    return {};
  });

  const page = createPageInstance();
  (options.data as any)?.call(page, {});
  options.onLoad?.call(page, {});
  expect(page).toHaveProperty('onShareAppMessage');
  expect((page as any).onShareAppMessage({ from: 'menu' })).toEqual({ title: 'title', path: 'path' });
});

it('shoule merge the mutiple `onShareAppMessage` results.', () => {
  const options = setupPage(() => {
    usePageLifeCycle('onShareAppMessage', () => {
      return { title: 'title1', path: 'path1', desc: 'desc1' };
    });
    usePageLifeCycle('onShareAppMessage', () => {
      return { title: 'title2', path: 'path2' };
    });
    return {};
  });

  const page = createPageInstance();
  (options.data as any)?.call(page, {});
  options.onLoad?.call(page, {});
  expect(page).toHaveProperty('onShareAppMessage');
  expect((page as any).onShareAppMessage({ from: 'menu' })).toEqual({ title: 'title2', path: 'path2', desc: 'desc1' });
});
