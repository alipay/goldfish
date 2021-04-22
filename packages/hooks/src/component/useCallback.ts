import CallbackContext from './CallbackContext';

export default function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: React.DependencyList): T {
  const context = CallbackContext.current;
  return context.set(callback, deps) as T;
}
