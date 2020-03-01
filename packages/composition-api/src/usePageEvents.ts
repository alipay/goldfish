import PageSetup from './setup/PageSetup';
import checkSetupEnv from './checkSetupEnv';

export default function usePageEvents<F extends (keyof tinyapp.IPageEvents)>(
  name: F,
  fn: tinyapp.IPageEvents[F],
) {
  checkSetupEnv('usePageLifeCycle', ['page']);

  const setup = PageSetup.getCurrent<PageSetup>();
  setup.addMethod(`events.${name}` as any, fn);
}
