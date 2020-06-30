import { call, getCurrent, DepList, IErrorCallback } from './dep';

export type AutorunFunction = () => void;

class Runner {
  public depList?: DepList;

  private isStopped = false;

  private removeListenersGroup: Function[][] = [];

  constructor(fn: AutorunFunction, errorCb?: IErrorCallback) {
    this.autorun(fn, errorCb);
  }

  private autorun(fn: AutorunFunction, errorCb?: IErrorCallback) {
    call(() => {
      fn();
      this.depList = getCurrent();
      const removeFns = this.depList.addChangeListener(() => {
        !this.isStopped && this.autorun(fn);
      });
      this.removeListenersGroup.push(removeFns);
    }, errorCb);
  }

  stop() {
    this.isStopped = true;
    this.removeListenersGroup.forEach(group => group.forEach(fn => fn()));
    this.removeListenersGroup = [];
  }
}

export default function autorun(fn: AutorunFunction, errorCb?: IErrorCallback) {
  const runner = new Runner(fn, errorCb);
  const stopFn: (() => void) & { depList?: DepList } = () => runner.stop();
  stopFn.depList = runner.depList;
  return stopFn;
}
