import useState from './useState';

interface IRef<T> {
  current: T | undefined;
  (val: T): void;
}

export default function useRef<T>() {
  const ref: IRef<T> = (val: T) => {
    ref.current = val;
  };
  ref.current = undefined;
  return useState<IRef<T>>(ref);
}
