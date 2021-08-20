import EffectContext from '../context/EffectContext';

export default function useEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const context = EffectContext.current;
  context.add(effect, deps);
}
