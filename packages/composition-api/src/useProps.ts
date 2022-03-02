import { IProps } from '@goldfishjs/reactive-connect';
import checkSetupEnv from './checkSetupEnv';
import ComponentSetup from './setup/ComponentSetup';

export default function useProps<P extends IProps>() {
  checkSetupEnv('useProps', ['component']);

  const setup = ComponentSetup.getCurrent<ComponentSetup>();
  return setup.props as P;
}
