import { useAutorun as baseUseAutorun } from '@goldfishjs/composition-api';
import useContextType from './useContextType';
import ComponentSetup from './ComponentSetup';
import { autorun } from '@goldfishjs/reactive';

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
