import { getCurrent, EventName, IAppOptionsMethods } from '../context/AppEventContext';
import useContainerType from './useContainerType';

export default function useAppEvent<T extends EventName>(eventName: T, callback: Required<IAppOptionsMethods>[T]) {
  const type = useContainerType();
  if (type !== 'app') {
    throw new Error('Do not call `useAppEvent` out of the App container.');
  }

  const current = getCurrent();
  current.add({
    name: eventName,
    callback,
  });
}
