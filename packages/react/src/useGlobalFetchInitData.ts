import useContextType from './useContextType';
import { global } from './Global';

export default function useGlobalFetchInitData(
  fn: () => Promise<void>,
  isAsync = true,
) {
  const type = useContextType();
  if (type === 'react') {
    global.initData.addFetchInitDataMethod(fn, isAsync);
  } else {
    throw new Error(`Wrong context: ${type}`);
  }
}
