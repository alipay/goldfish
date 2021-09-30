import useContainerType from './useContainerType';
import { getCurrent } from '../context/InstanceContext';

export default function usePageQuery(): undefined | Record<string, any> {
  const containerType = useContainerType();
  const instanceContext = getCurrent();

  if (containerType === 'component') {
    return instanceContext.get()?.$page.$$query;
  }

  if (containerType === 'page') {
    return instanceContext.get()?.$$query;
  }

  return;
}
