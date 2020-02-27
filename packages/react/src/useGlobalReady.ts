import { useReady as baseUseReady } from '@goldfishjs/composition-api';
import useContextType from './useContextType';
import usePluginsReady from './usePluginsReady';
import { global } from './Global';

export default function useGlobalReady() {
  const type = useContextType();
  if (type === 'react') {
    const pluginsReady = usePluginsReady();
    return () => {
      return Promise.all([
        pluginsReady(),
        global.initData.waitForReady(),
      ]);
    };
  }

  return baseUseReady();
}
