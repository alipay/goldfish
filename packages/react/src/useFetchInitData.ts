import { useFetchInitData as baseUseFetchInitData } from '@goldfishjs/composition-api';
import ComponentSetup from './ComponentSetup';
import useContextType from './useContextType';

export default function useFetchInitData(fn: () => Promise<void>, isAsync = true) {
  const type = useContextType();
  if (type === 'react') {
    const setup = ComponentSetup.getCurrent<ComponentSetup>();
    setup.initData.addFetchInitDataMethod(fn, isAsync);
  } else {
    baseUseFetchInitData(fn, isAsync);
  }
}
