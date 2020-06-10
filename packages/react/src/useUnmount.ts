import ComponentSetup from './ComponentSetup';
import useContextType from './useContextType';
import { usePageLifeCycle, useComponentLifeCycle } from '@goldfishjs/composition-api';

export default function useUnmount(fn: () => void) {
  const contextType = useContextType();
  if (contextType === 'react') {
    const setup = ComponentSetup.getCurrent<ComponentSetup>();
    setup.unmountFns.push(fn);
  } else if (contextType === 'page') {
    usePageLifeCycle('onUnload', fn);
  } else if (contextType === 'component') {
    useComponentLifeCycle('didUnmount', fn);
  } else {
    throw new Error(`The useUnmount can not be used in ${contextType} setup flow.`);
  }
}
