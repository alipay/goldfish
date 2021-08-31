import { getCurrent } from '../context/CallbackContext';

export default function useCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T {
  const context = getCurrent();
  return context.add(callback, deps) as T;
}
