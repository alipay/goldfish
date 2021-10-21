import { default as App, app } from '../common/App';
import useState from './useState';
import useRef from './useRef';
import useEffect from './useEffect';

export default function useGlobalData<G extends Record<string, any>>(passInApp?: App) {
  // use `counter` to trigger the re-render.
  const [counter, setCounter] = useState(0);
  const updater = useRef<() => void>();
  const realGlobal = passInApp || app;

  useEffect(() => {
    return () => {
      for (let key in realGlobal.dataChangeUpdaters) {
        realGlobal.dataChangeUpdaters[key as string] = (realGlobal.dataChangeUpdaters[key as string] || []).filter(
          fn => fn !== updater.current,
        );
      }
    };
  });

  return {
    get<T extends keyof G>(key: T): G[T] | undefined {
      realGlobal.dataChangeUpdaters[key as string] = (realGlobal.dataChangeUpdaters[key as string] || []).filter(
        fn => fn !== updater.current,
      );
      updater.current = () => setCounter(counter + 1);
      realGlobal.dataChangeUpdaters[key as string].push(updater.current);

      return realGlobal.data[key as string];
    },
    set<T extends keyof G>(key: T, value: G[T]) {
      if (realGlobal.data[key as string] !== value) {
        realGlobal.data[key as string] = value;
        (realGlobal.dataChangeUpdaters[key as string] || []).forEach(fn => fn());
      }
    },
  };
}
