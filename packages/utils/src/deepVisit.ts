import isObject from './isObject';

interface ICallback {
  (value: any, key: string | number, parentObject: any, keyPathList: (string | number)[]): boolean | void;
}

function run(
  obj: any,
  callback: ICallback,
  keyPathList: (string | number)[],
  visitedObjList: any[],
): ReturnType<ICallback> {
  const visit = (key: string | number) => {
    const value = obj[key];
    if (visitedObjList.indexOf(value) === -1) {
      const curKeyPathList = [...keyPathList, key];
      visitedObjList.push(value);
      const r = callback(value, key, obj, curKeyPathList);
      if (r === true) {
        return r;
      }

      if (run(value, callback, curKeyPathList, visitedObjList) === true) {
        return true;
      }
    }
  };

  if (Array.isArray(obj)) {
    for (let i = 0, il = obj.length; i < il; i += 1) {
      if (true === visit(i)) {
        return true;
      }
    }
  } else if (isObject(obj)) {
    for (const key in obj) {
      if (true === visit(key)) {
        return true;
      }
    }
  }
}

export default function deepVisit(obj: any, callback: ICallback) {
  run(obj, callback, [], []);
}
