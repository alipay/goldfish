import { call, getCurrent, DepList, IErrorCallback } from './dep';

export type AutorunFunction = () => void;

class Runner {
  public depList?: DepList;

  private isStopped = false;

  constructor(fn: AutorunFunction, errorCb?: IErrorCallback) {
    this.autorun(fn, errorCb);
  }

  private autorun(fn: AutorunFunction, errorCb?: IErrorCallback) {
    call(
      () => {
        fn();
        this.depList = getCurrent();
        this.depList.addChangeListener(() => {
          !this.isStopped && this.autorun(fn);
        });
      },
      errorCb,
    );
  }

  stop() {
    this.isStopped = true;
  }
}

export default function autorun(fn: AutorunFunction, errorCb?: IErrorCallback) {
  const runner = new Runner(fn, errorCb);
  const stopFn: (() => void) & { depList?: DepList} = () => runner.stop();
  stopFn.depList = runner.depList;
  return stopFn;
}
