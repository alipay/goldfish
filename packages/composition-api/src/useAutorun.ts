import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import { AppStore, PageStore, ComponentStore } from '@goldfishjs/core';
import checkSetupEnv from './checkSetupEnv';

export default function useAutorun() {
  checkSetupEnv('useAutorun', ['app', 'page', 'component']);

  const type = useContextType();

  if (type === 'app') {
    const store = CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance() as AppStore;
    return store.autorun.bind(store);
  }

  if (type === 'page') {
    const store =
      CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance() as PageStore;
    return store.autorun.bind(store);
  }

  if (type === 'component') {
    const store =
      CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance() as ComponentStore<{}>;
    return store.autorun.bind(store);
  }

  throw new Error('Unknown context.');
}
