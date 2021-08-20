import useMemo from './useMemo';

export default function useRef<T>(initialValue: T): React.MutableRefObject<T>;
export default function useRef<T>(initialValue: T | null): React.RefObject<T>;
export default function useRef<T = undefined>(): React.MutableRefObject<T | undefined>;
export default function useRef(initialValue?: any): any {
  /* eslint-disable react-hooks/exhaustive-deps */
  const ref = useMemo(() => {
    return {
      current: initialValue,
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */
  return ref;
}
