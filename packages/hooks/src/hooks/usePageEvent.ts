import { getCurrent, EventName, Instance } from '../context/PageEventContext';
import useContainerType from './useContainerType';

export default function usePageEvent<T extends EventName>(eventName: T, callback: Required<Instance>[T]) {
  const type = useContainerType();
  if (type !== 'page') {
    throw new Error('Do not call `usePageEvent` out of the Page container.');
  }

  const current = getCurrent();
  current.add({
    name: eventName,
    callback,
  });
}
