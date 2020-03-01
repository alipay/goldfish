import useContextType from './useContextType';
import { default as Global, global } from './Global';

export default function useGlobalFetchInitData(
  fn: () => Promise<void>,
  isAsync = true,
  passInGlobal?: Global,
) {
  const realGlobal = passInGlobal || global;

  const type = useContextType();
  if (type === 'react') {
    realGlobal.initData.addFetchInitDataMethod(fn, isAsync);
  } else {
    throw new Error(`Wrong context: ${type}`);
  }
}
