export type SourceType = 'computed' | 'normal' | 'notify';
type CheckChangeMethod = (n: any, o: any) => boolean;

type DepListener = (
  newValue: any,
  oldValue: any,
  type: SourceType,
  isChanged: CheckChangeMethod,
) => void;

function defaultIsChanged(n: any, o: any) {
  return n !== o;
}

export class Dep {
  private listenerList: DepListener[] = [];

  private obj: any;

  private key: string | number;

  public constructor(obj: any, key: string | number) {
    this.obj = obj;
    this.key = key;
  }

  public addListener(listener: DepListener) {
    this.listenerList.push(listener);
    return () => {
      this.listenerList = this.listenerList.filter(l => l !== listener);
    };
  }

  public notifyChange(
    newValue: any,
    oldValue: any,
    type: SourceType = 'normal',
    isChanged: CheckChangeMethod = defaultIsChanged,
  ) {
    this.listenerList.forEach((listener) => {
      listener(newValue, oldValue, type, isChanged);
    });
  }
}

export class DepList {
  private list: Dep[] = [];

  public add(dep: Dep) {
    this.list.push(dep);
  }

  public addChangeListener(
    cb: (n: any, o: any, type: SourceType) => void,
    shouldBatch: boolean = true,
  ) {
    const removeListeners: Function[] = [];
    let isDone = false;
    const checker = (n: any, o: any, type: SourceType, isChanged: CheckChangeMethod): void => {
      if (type !== 'notify' && !isChanged(n, o)) {
        return;
      }

      if (!shouldBatch) {
        cb(n, o, type);
      } else {
        if (isDone) {
          return;
        }

        removeListeners.forEach(fn => fn());
        isDone = true;
        Promise.resolve().then(() => cb(n, o, type));
      }
    };
    this.list.forEach((dep) => {
      removeListeners.push(dep.addListener(checker));
    });
  }
}

const stack: DepList[] = [];

export function getCurrent() {
  return stack[stack.length - 1];
}

export interface IErrorCallback {
  (error: any): void;
}

export function call(fn: Function, errorCb?: IErrorCallback) {
  stack.push(new DepList());
  try {
    fn();
  } catch (error) {
    errorCb && errorCb(error);
  } finally {
    stack.pop();
  }
}
