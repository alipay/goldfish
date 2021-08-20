import { ComponentStore } from '@goldfishjs/core';
import { IProps } from '@goldfishjs/reactive-connect';
import checkSetupEnv from './checkSetupEnv';
import ComponentSetup from './setup/ComponentSetup';

export default function useProps<P extends IProps>() {
  checkSetupEnv('useProps', ['component']);

  const setup = ComponentSetup.getCurrent<ComponentSetup>();
  const store = setup.getStoreInstance()! as ComponentStore<P>;

  return store.props;
}
