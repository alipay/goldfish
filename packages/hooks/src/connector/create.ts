import StateContext from '../context/StateContext';
import EffectContext from '../context/EffectContext';
import CallbackContext from '../context/CallbackContext';
import MemoContext from '../context/MemoContext';

export interface IOptions {
  init: () => void;
}

export interface ICreateFunction<P> {
  (props?: P): {
    data: Record<string, any>;
  };
}

export interface IHostInstance<P> {
  $$stateContext?: StateContext;
  $$effectContext?: EffectContext;
  $$callbackContext?: CallbackContext;
  $$memoContext?: MemoContext;
  props?: P;
  setData: tinyapp.SetDataMethod<any>;
}

export default function create<P>(fn: ICreateFunction<P>) {
  const executeFn = function (this: IHostInstance<P>, fn: () => ReturnType<ICreateFunction<any>>) {
    let wrappedFn = this.$$memoContext?.wrap(fn) || fn;
    wrappedFn = this.$$effectContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$callbackContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$stateContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn();
  };

  const options = {
    init(this: IHostInstance<P>) {
      const effectContext = new EffectContext();
      this.$$effectContext = effectContext;

      const stateContext = new StateContext(
        this,
        () => {
          executeFn.call(this, () => fn(this.props));
        },
        () => {
          this.$$effectContext?.executeEffect();
        },
      );
      this.$$stateContext = stateContext;

      const callbackContext = new CallbackContext();
      this.$$callbackContext = callbackContext;

      const memoContext = new MemoContext();
      this.$$memoContext = memoContext;

      executeFn.call(this, () => fn(this.props));
    },
    mounted(this: IHostInstance<P>) {
      this.$$effectContext?.executeEffect();
    },
    unmounted(this: IHostInstance<P>) {
      this.$$stateContext?.destroy();
      this.$$effectContext?.destroy();
      this.$$callbackContext?.destroy();
      this.$$memoContext?.destroy();
    },
    syncProps(this: IHostInstance<P>, nextProps?: P) {
      executeFn.call(this, () => fn(nextProps));
    },
  };
  return options;
}
