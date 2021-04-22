import { getCurrent } from './StateContext';

export default function useState<V>(initialValue?: V) {
  const context = getCurrent();
  return context.add(initialValue);
}
