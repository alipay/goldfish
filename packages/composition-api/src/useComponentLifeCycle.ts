import ComponentSetup from './setup/ComponentSetup';
import checkSetupEnv from './checkSetupEnv';

type FullMethods = Required<tinyapp.IComponentLifeCycleMethods<any, any>>;

export default function useComponentLifeCycle<F extends (keyof FullMethods)>(
  name: F,
  fn: FullMethods[F],
) {
  checkSetupEnv('useComponentLifeCycle', ['component']);

  const setup = ComponentSetup.getCurrent<ComponentSetup>();
  setup.addMethod(name, fn);
}
