import useContainerType from './useContainerType';
import { getCurrent } from '../context/InstanceContext';

export default function usePageQuery(): undefined | Record<string, any> {
  const containerType = useContainerType();
  const instanceContext = getCurrent();

  if (containerType && ['page', 'component'].indexOf(containerType) !== -1) {
    const companionObject = instanceContext.get();
    if (!companionObject) {
      return undefined;
    }
    if (companionObject.status !== 'initializing') {
      return Promise.resolve(companionObject.query);
    }
    return new Promise(resolve => {
      const stop = companionObject.addStatusChangeListener(() => {
        stop();
        resolve(companionObject.query);
      });
    });
  }

  return;
}
