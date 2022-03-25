import { IHostInstance } from './create';
import { Status } from '../context/StateContext';

export class CompanionObjectManager {
  private map: Record<string, IHostInstance<any> | null> = {};

  public add(id: string, obj: IHostInstance<any>) {
    if (!this.map[id]) {
      this.map[id] = obj;
    }
  }

  public get(id: string) {
    return this.map[id];
  }

  public remove(id: string) {
    if (this.map[id]) {
      this.map[id] = null;
    }
  }

  public create(params: Pick<IHostInstance<any>, 'setData' | 'batchedUpdates' | 'spliceData'>) {
    type Status = 'initializing' | 'ready' | 'destroyed';

    let status: Status = 'initializing';
    let statusChangeListenerList: ((s: Status) => void)[] = [];

    let methods: Record<string, Function> = {};
    let methodsChangeListenerList: ((m: Record<string, Function>) => void)[] = [];

    const result: IHostInstance<any> = {
      get methods() {
        return methods;
      },
      set methods(m: Record<string, Function>) {
        methods = m;
        methodsChangeListenerList.forEach(l => l(methods));
      },
      addMethodsChangeListener(listener) {
        methodsChangeListenerList.push(listener);
        return () => {
          methodsChangeListenerList = methodsChangeListenerList.filter(l => l !== listener);
        };
      },
      setData: params.setData,
      batchedUpdates: params.batchedUpdates,
      spliceData: params.spliceData,
      get status() {
        return status;
      },
      set status(v) {
        status = v;
        statusChangeListenerList.forEach(l => l(status));
      },
      addStatusChangeListener(listener) {
        statusChangeListenerList.push(listener);
        return () => {
          statusChangeListenerList = statusChangeListenerList.filter(l => l !== listener);
        };
      },
      destroy() {
        statusChangeListenerList = [];
        methodsChangeListenerList = [];
      },
    };

    return result;
  }
}

export default new CompanionObjectManager();
