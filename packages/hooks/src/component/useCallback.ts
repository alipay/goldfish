import { getCurrent } from './CallbackContext';

export default function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: React.DependencyList): T {
  const context = getCurrent();
  return context.set(callback, deps) as T;
}
