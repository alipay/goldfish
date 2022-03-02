import qs from 'qs';
import type PageSetup from '@goldfishjs/composition-api/lib/setup/PageSetup';
import type ComponentSetup from '@goldfishjs/composition-api/lib/setup/ComponentSetup';
import CommonSetup from '@goldfishjs/composition-api/lib/setup/CommonSetup';
import useContextType from './useContextType';
import ReactComponentSetup from './ComponentSetup';
import useWatch from './useWatch';

export default function usePageQuery() {
  const watch = useWatch();
  const handleQuery = (query?: { data: any }) => {
    return new Promise<Record<string, any> | undefined>(resolve => {
      if (query) {
        watch(
          () => query.data,
          data => resolve(data),
        );
      } else {
        resolve(undefined);
      }
    });
  };

  const contextType = useContextType();
  if (contextType === 'page') {
    const pageSetup = CommonSetup.getCurrent<PageSetup>();
    const query = pageSetup.query;
    return handleQuery(query);
  }

  if (contextType === 'component') {
    const componentSetup = CommonSetup.getCurrent<ComponentSetup>();
    const query = componentSetup.getViewInstance()?.$page?.$setup?.query;
    return handleQuery(query);
  }

  if (contextType === 'react') {
    const isMini = typeof window === 'undefined';
    if (isMini) {
      const componentSetup = CommonSetup.getCurrent<ReactComponentSetup>();
      return Promise.resolve(componentSetup?.viewInstance?.query);
    }

    return Promise.resolve(qs.parse(window.location.search.replace(/^\?/, '')));
  }

  throw new Error(`The useQuery can not be used in ${contextType} setup flow.`);
}
