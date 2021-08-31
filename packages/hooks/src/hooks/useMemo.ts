import { getCurrent } from '../context/MemoContext';

export default function useMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return getCurrent().add(factory, deps) as any;
}
