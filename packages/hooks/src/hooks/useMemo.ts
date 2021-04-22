import MemoContext from '../context/MemoContext';

export default function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T {
  return MemoContext.current.set(factory, deps);
}
