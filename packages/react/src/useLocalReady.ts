import useGlobalReady from './useGlobalReady';
import useContextType from './useContextType';
import ComponentSetup from './ComponentSetup';

export default function useLocalReady() {
  const globalReady = useGlobalReady();
  const type = useContextType();
  if (type === 'react') {
    const setup = ComponentSetup.getCurrent<ComponentSetup>();
    return () => {
      return Promise.all([globalReady(), setup.initData.waitForReady()]);
    };
  }

  throw new Error(`Wrong context type: ${type}`);
}
