import PageSetup from './setup/PageSetup';
import checkSetupEnv from './checkSetupEnv';

type FullMethods = Required<tinyapp.IPageOptionsMethods>;

export default function usePageLifeCycle<F extends keyof FullMethods>(name: F, fn: FullMethods[F]) {
  checkSetupEnv('usePageLifeCycle', ['page']);

  const setup = PageSetup.getCurrent<PageSetup>();
  // Treat the `onShareAppMessage` to an instance member.
  if (name === 'onShareAppMessage') {
    setup.addInstanceMethod('onShareAppMessage', fn);
  } else {
    setup.addMethod(name, fn);
  }
}
