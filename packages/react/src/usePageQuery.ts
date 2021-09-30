import qs from 'qs';
import type PageSetup from '@goldfishjs/composition-api/lib/setup/PageSetup';
import type ComponentSetup from '@goldfishjs/composition-api/lib/setup/ComponentSetup';
import CommonSetup from '@goldfishjs/composition-api/lib/setup/CommonSetup';
import useContextType from './useContextType';
import ReactComponentSetup from './ComponentSetup';

export default function usePageQuery() {
  const contextType = useContextType();
  if (contextType === 'page') {
    const pageSetup = CommonSetup.getCurrent<PageSetup>();
    return pageSetup.query;
  }

  if (contextType === 'component') {
    const componentSetup = CommonSetup.getCurrent<ComponentSetup>();
    return componentSetup.getViewInstance()?.$page?.$setup?.query;
  }

  if (contextType === 'react') {
    const isMini = typeof window === 'undefined';
    if (isMini) {
      const componentSetup = CommonSetup.getCurrent<ReactComponentSetup>();
      return componentSetup?.viewInstance?.query;
    }

    return qs.parse(window.location.search.replace(/^?/, ''));
  }

  throw new Error(`The useQuery can not be used in ${contextType} setup flow.`);
}
