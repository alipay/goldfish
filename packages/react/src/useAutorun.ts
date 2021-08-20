import { useAutorun as baseUseAutorun } from '@goldfishjs/composition-api';
import { autorun } from '@goldfishjs/reactive';
import useContextType from './useContextType';
import ComponentSetup from './ComponentSetup';

export default function useAutorun() {
  const type = useContextType();
  if (type === 'react') {
    const setup = ComponentSetup.getCurrent();
    if (setup && setup instanceof ComponentSetup) {
      return (...args: Parameters<typeof autorun>) => {
        const stop = autorun(...args);
        setup.addAutorunStopFn(stop);
        return stop;
      };
    }
  }

  return baseUseAutorun();
}
