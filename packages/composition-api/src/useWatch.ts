import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import { AppStore, PageStore, ComponentStore } from '@goldfishjs/core';
import checkSetupEnv from './checkSetupEnv';

export default function useWatch() {
  checkSetupEnv('useWatch', ['app', 'page', 'component']);

  const type = useContextType();

  if (type === 'app') {
    const store = CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance() as AppStore;
    return store.watch.bind(store);
  }

  if (type === 'page') {
    const store =
      CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance() as PageStore;
    return store.watch.bind(store);
  }

  if (type === 'component') {
    const store =
      CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance() as ComponentStore<{}>;
    return store.watch.bind(store);
  }

  throw new Error('Unknown context.');
}
