import { Methods } from './observable';

export type SourceType = 'computed' | 'normal' | 'notify';
type CheckChangeMethod = (n: any, o: any) => boolean;

export type ChangeOptions = {
  type: SourceType;
  isChanged: CheckChangeMethod;
  isArray?: boolean;
  method?: Methods;
  args?: any[];
  oldV?: any[];
};

type DepListener = (
  newValue: any,
  oldValue: any,
  options: ChangeOptions,
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
    options?: Partial<ChangeOptions>,
  ) {
    const realOptions = {
      type: options && options.type || 'normal',
      isChanged: options && options.isChanged || defaultIsChanged,
      ...(options || {}),
    };
    this.listenerList.forEach((listener) => {
      listener(newValue, oldValue, realOptions);
    });
  }
}

export class DepList {
  private list: Dep[] = [];

  public add(dep: Dep) {
    this.list.push(dep);
  }

  public addChangeListener(
    cb: (n: any, o: any, options: ChangeOptions) => void,
    shouldBatch = true,
  ) {
    const removeListeners: Function[] = [];
    let isDone = false;
    const checker = (
      n: any,
      o: any,
      options: ChangeOptions,
    ): void => {
      if (options.type !== 'notify' && !options.isChanged(n, o)) {
        return;
      }

      if (!shouldBatch || options.isArray) {
        cb(n, o, options);
      } else {
        if (isDone) {
          return;
        }

        isDone = true;
        Promise.resolve().then(() => cb(n, o, options));
      }
    };
    this.list.forEach((dep) => {
      removeListeners.push(dep.addListener(checker));
    });
    return [
      () => {
        removeListeners.forEach(fn => fn());
        removeListeners.splice(0, removeListeners.length);
      },
    ];
  }
}

const stack: DepList[] = [];

export function getCurrent() {
  return stack[stack.length - 1];
}

export interface IErrorCallback {
  (error: any): void;
}

/**
 * Collect dependencies in `fn`.
 *
 * @param fn
 * @param errorCb
 */
export function call(fn: Function, errorCb?: IErrorCallback) {
  stack.push(new DepList());
  try {
    fn();
  } catch (error) {
    if (errorCb) {
      errorCb(error);
    } else {
      throw error;
    };
  } finally {
    stack.pop();
  }
}
