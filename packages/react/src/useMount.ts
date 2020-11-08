import ComponentSetup from './ComponentSetup';
import useContextType from './useContextType';
import { useComponentLifeCycle, usePageLifeCycle } from '@goldfishjs/composition-api';

export default function useMount(fn: () => void): void {
  const contextType = useContextType();
  if (contextType === 'react') {
    const setup = ComponentSetup.getCurrent<ComponentSetup>();
    setup.mountFns.push(fn);
  } else if (contextType === 'component') {
    useComponentLifeCycle('didMount', fn);
  } else if (contextType === 'page') {
    usePageLifeCycle('onReady', fn);
  } else {
    throw new Error(`The useMount can not be used in ${contextType} setup flow.`);
  }
}
