import { getCurrent } from '../context/MemoContext';

export default function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T {
  return getCurrent().add(factory, deps);
}
