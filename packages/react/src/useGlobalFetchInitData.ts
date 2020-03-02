import useContextType from './useContextType';
import { default as App, app } from './App';

export default function useGlobalFetchInitData(
  fn: () => Promise<void>,
  isAsync = true,
  passInApp?: App,
) {
  const realGlobal = passInApp || app;

  const type = useContextType();
  if (type === 'react') {
    realGlobal.initData.addFetchInitDataMethod(fn, isAsync);
  } else {
    throw new Error(`Wrong context: ${type}`);
  }
}
