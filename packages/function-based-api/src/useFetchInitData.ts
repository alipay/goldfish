import CommonSetup from './setup/CommonSetup';
import checkSetupEnv from './checkSetupEnv';

export default function useFetchInitData(
  fn: () => Promise<void>,
  isAsync: boolean = true,
) {
  checkSetupEnv('useFetchInitData', ['page', 'app']);

  const setup = CommonSetup.getCurrent<CommonSetup<any>>();
  setup.addFetchInitDataMethod(fn, isAsync);
}
