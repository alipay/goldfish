import checkSetupEnv from './checkSetupEnv';
import AppSetup from './setup/AppSetup';

type AppFullMethods = Required<tinyapp.IAppOptionsMethods>;

export default function useAppLifeCycle<F extends keyof tinyapp.IAppOptionsMethods>(
  name: F,
  fn: AppFullMethods[F],
) {
  checkSetupEnv('useAppLifeCycle', ['app']);

  const setup = AppSetup.getCurrent<AppSetup>();
  setup.addMethod(name, fn);
}
