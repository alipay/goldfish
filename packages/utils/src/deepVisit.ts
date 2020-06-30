import isObject from './isObject';
import DeepVisitBreak from './DeepVisitBreak';

export interface ICallback {
  (value: any, key: string | number, parentObject: any, keyPathList: (string | number)[]): DeepVisitBreak;
}

function run(
  obj: any,
  callback: ICallback,
  keyPathList: (string | number)[],
  visitedObjList: any[],
): ReturnType<ICallback> {
  const visit = (key: string | number): DeepVisitBreak => {
    const value = obj[key];
    const curKeyPathList = [...keyPathList, key];
    // If the `value` is an object, we should check the circular.
    if (isObject(value)) {
      // Encounter the circular.
      if (visitedObjList.indexOf(value) !== -1) {
        // Although it is a circle, we should also visit the circle key.
        callback(value, key, obj, curKeyPathList);
        return DeepVisitBreak.CHILDREN;
      }
      visitedObjList.push(value);
    }

    visitedObjList.push(value);
    const r = callback(value, key, obj, curKeyPathList);
    if (r === DeepVisitBreak.ALL) {
      return DeepVisitBreak.ALL;
    }

    if (r !== DeepVisitBreak.CHILDREN && run(value, callback, curKeyPathList, visitedObjList) === DeepVisitBreak.ALL) {
      return DeepVisitBreak.ALL;
    }

    return DeepVisitBreak.NO;
  };

  if (Array.isArray(obj)) {
    for (let i = 0, il = obj.length; i < il; i += 1) {
      const visitResult = visit(i);
      if (DeepVisitBreak.ALL === visitResult) {
        return DeepVisitBreak.ALL;
      }
    }
  } else if (isObject(obj)) {
    for (const key in obj) {
      const visitResult = visit(key);
      if (DeepVisitBreak.ALL === visitResult) {
        return DeepVisitBreak.ALL;
      }
    }
  }

  return DeepVisitBreak.NO;
}

/**
 * Visit the object deeply, but ignore the root.
 *
 * @param obj
 * @param callback
 */
export default function deepVisit(obj: any, callback: ICallback) {
  run(obj, callback, [], [obj]);
}
