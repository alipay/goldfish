import { usePluginsReady as baseUsePluginsReady } from '@goldfishjs/composition-api';
import useContextType from './useContextType';
import { global } from './Global';

export default function usePluginsReady() {
  const type = useContextType();
  if (type === 'react') {
    return () => global.waitForPluginsReady();
  }

  return baseUsePluginsReady();
}
