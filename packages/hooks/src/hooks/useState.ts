import StateContext from '../context/StateContext';

export default function useState<S>(initialState: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>];
export default function useState<S = undefined>(): [S | undefined, React.Dispatch<React.SetStateAction<S | undefined>>];
export default function useState<V>(initialValue?: V) {
  const context = StateContext.current;
  return context.add(initialValue);
}
