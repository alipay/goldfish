import { isArray } from './utils';
import { isObject } from '@goldfishjs/utils';

const RAW_FLAG = {};
const RAW_KEY = '__raw-ob__';

export function isRaw(obj: any) {
  return obj
    && Object.prototype.hasOwnProperty.call(obj, RAW_KEY)
    && obj[RAW_KEY] === RAW_FLAG;
}

function clone(obj: any) {
  let cloneObj = obj;

  if (isArray(obj)) {
    cloneObj = [...obj];
  } else if (isObject(obj)) {
    cloneObj = { ...obj };
  }

  return cloneObj;
}

export function unraw<T>(obj: T): T {
  return isRaw(obj) ? clone(obj) : obj;
}

export default function raw<T>(obj: T): T {
  const cloneObj = clone(obj);

  if (isObject(obj) && (obj as any)[RAW_KEY] !== RAW_FLAG) {
    Object.defineProperty(cloneObj, RAW_KEY, {
      value: RAW_FLAG,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }

  return cloneObj;
}
