import { useWatch as baseUseWatch } from '@goldfishjs/composition-api';
import useContextType from './useContextType';
import ComponentSetup from './ComponentSetup';
import { watch, IWatchExpressionFn, IWatchCallback, IWatchOptions } from '@goldfishjs/reactive';

export default function useWatch() {
  const type = useContextType();
  if (type === 'react') {
    const setup = ComponentSetup.getCurrent();
    if (setup && setup instanceof ComponentSetup) {
      return <R>(fn: IWatchExpressionFn<R>, cb: IWatchCallback<R>, options?: IWatchOptions) => {
        const stop = watch(fn, cb, options);
        setup.addWatchStopFn(stop);
        return stop;
      };
    }
  }

  return baseUseWatch();
}
