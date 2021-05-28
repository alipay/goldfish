import useSetup from './useSetup';
import { ReactLike } from './observer';

export default function useReactiveData<R>(reactLike: ReactLike, jsxFn: () => R): R {
  const { connect } = useSetup(reactLike, () => {
    return {};
  });
  return connect(jsxFn);
}
