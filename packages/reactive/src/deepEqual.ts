import { isObject, isArray, IIndexedObject } from './utils';

function isArrayEqual(a1: any[], a2: any[]) {
  if (a1.length !== a2.length) {
    return false;
  }

  for (const index in a1) {
    if (!deepEqual(a1[index], a2[index])) {
      return false;
    }
  }

  return true;
}

function isObjectEqual(o1: IIndexedObject, o2: IIndexedObject) {
  if (!isArrayEqual(Object.keys(o1), Object.keys(o2))) {
    return;
  }

  for (const key in o1) {
    if (!deepEqual(o1[key], o2[key])) {
      return false;
    }
  }

  return true;
}

export default function deepEqual(v1: any, v2: any) {
  const v1IsObject = isObject(v1);
  const v2IsObject = isObject(v2);

  if (!v1IsObject || !v2IsObject) {
    return v1 === v2;
  }

  const v1IsArray = isArray(v1);
  const v2IsArray = isArray(v2);

  if (v1IsArray !== v2IsArray) {
    return false;
  }

  if (v1IsArray && v2IsArray) {
    return isArrayEqual(v1, v2);
  }

  return isObjectEqual(v1, v2);
}
