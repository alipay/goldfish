import checkSetupEnv from './checkSetupEnv';
import AppSetup from './setup/AppSetup';

type AppFullMethods = Required<tinyapp.IAppOptionsMethods>;

export default function useAppLifeCycle<F extends keyof tinyapp.IAppOptionsMethods>(name: F, fn: AppFullMethods[F]) {
  checkSetupEnv('useAppLifeCycle', ['app']);

  const setup = AppSetup.getCurrent<AppSetup>();
  // Treat the `onShareAppMessage` to an instance member.
  if (name === 'onShareAppMessage') {
    setup.addInstanceMethod('onShareAppMessage', fn);
  } else {
    setup.addMethod(name, fn);
  }
}
