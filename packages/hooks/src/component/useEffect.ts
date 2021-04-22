import { getCurrent } from './EffectContext';

export default function useEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const context = getCurrent();
  context.add(effect, deps);
}
