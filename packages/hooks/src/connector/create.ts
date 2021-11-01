import StateContext from '../context/StateContext';
import EffectContext from '../context/EffectContext';
import CallbackContext from '../context/CallbackContext';
import MemoContext from '../context/MemoContext';
import AppEventContext from '../context/AppEventContext';
import PageEventContext from '../context/PageEventContext';
import InstanceContext, { ContainerType } from '../context/InstanceContext';
import View from '../common/View';

export interface IOptions {
  init: () => void;
}

export type CreateFunction = (props?: any) => { data: Record<string, any>; [k: string]: any };

export interface IHostInstance<P> extends View {
  $$stateContext?: StateContext;
  $$effectContext?: EffectContext;
  $$callbackContext?: CallbackContext;
  $$memoContext?: MemoContext;
  $$instanceContext?: InstanceContext;
  $$appEventContext?: AppEventContext;
  $$pageEventContext?: PageEventContext;
  props?: P;
  $$query?: Record<string, any>;
}

export default function create<P>(fn: CreateFunction, type?: ContainerType) {
  const executeFn = function (this: IHostInstance<P>, fn: () => ReturnType<CreateFunction>) {
    let wrappedFn = this.$$memoContext?.wrap(fn) || fn;
    wrappedFn = this.$$effectContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$callbackContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$instanceContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$appEventContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$pageEventContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn = this.$$stateContext?.wrap(wrappedFn) || wrappedFn;
    wrappedFn();
  };

  const options = {
    init(this: IHostInstance<P>) {
      this.$$isSyncDataSafe = true;
      const instanceContext = new InstanceContext();
      instanceContext.set(this);
      instanceContext.setContainerType(type);
      this.$$instanceContext = instanceContext;

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

      const appEventContext = new AppEventContext();
      this.$$appEventContext = appEventContext;

      const pageEventContext = new PageEventContext();
      this.$$pageEventContext = pageEventContext;

      executeFn.call(this, () => fn(this.props));
    },
    mounted(this: IHostInstance<P>) {
      this.$$effectContext?.executeEffect();
    },
    unmounted(this: IHostInstance<P>) {
      this.$$stateContext?.destroy();
      this.$$effectContext?.destroy();
      this.$$callbackContext?.destroy();
      this.$$appEventContext?.destroy();
      this.$$pageEventContext?.destroy();
      this.$$memoContext?.destroy();
      this.$$isSyncDataSafe = false;
    },
    executeEffect(this: IHostInstance<P>) {
      this.$$effectContext?.executeEffect();
    },
    syncProps(this: IHostInstance<P> & { $$oldProps?: Record<string, any> }, nextProps?: P) {
      executeFn.call(this, () => fn(nextProps));
    },
  };
  return options;
}
