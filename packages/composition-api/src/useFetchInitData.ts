import CommonSetup from './setup/CommonSetup';
import checkSetupEnv from './checkSetupEnv';
import PageSetup from './setup/PageSetup';
import AppSetup from './setup/AppSetup';
import ComponentSetup from './setup/ComponentSetup';

export default function useFetchInitData(
  fn: () => Promise<void>,
  isAsync: boolean = true,
) {
  checkSetupEnv('useFetchInitData', ['page', 'app', 'component']);

  const setup = CommonSetup.getCurrent<PageSetup | AppSetup | ComponentSetup>();
  setup.addFetchInitDataMethod(fn, isAsync);
}
