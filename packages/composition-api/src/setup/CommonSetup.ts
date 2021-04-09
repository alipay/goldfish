import Setup from './Setup';

export default class CommonSetup<M, S, V> extends Setup {
  private fetchInitDataMethod?: () => Promise<void>;

  private storeInstance?: S;

  private viewInstance?: V;

  private methods: { [K in keyof M]?: M[K][] } = {};

  public setViewInstance(val: V) {
    this.viewInstance = val;
  }

  public getViewInstance() {
    return this.viewInstance;
  }

  public addFetchInitDataMethod(fn: () => Promise<void>, isAsync = true) {
    const fetchInitDataMethod = this.fetchInitDataMethod;
    if (fetchInitDataMethod) {
      this.fetchInitDataMethod = isAsync
        ? async function (this: any) {
            await Promise.all([fetchInitDataMethod.call(this), fn.call(this)]);
          }
        : async function (this: any) {
            await fetchInitDataMethod.call(this);
            await fn.call(this);
          };
    } else {
      this.fetchInitDataMethod = fn;
    }
  }

  public getFetchInitDataMethod() {
    return this.fetchInitDataMethod;
  }

  public setStoreInstance(instance: S) {
    this.storeInstance = instance;
  }

  public getStoreInstance() {
    return this.storeInstance;
  }

  public addMethod<N extends keyof M>(name: N, fn: M[N]) {
    this.add(this.methods, name as string, fn);
  }

  public getMethod<N extends keyof M>(name: N) {
    return this.methods[name];
  }

  public iterateMethods(cb: <N extends keyof M>(fns: M[N][], name: N) => void) {
    for (const k in this.methods) {
      const methodFns = this.methods[k]!;
      cb(methodFns, k);
    }
  }
}
