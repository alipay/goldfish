import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import checkSetupEnv from './checkSetupEnv';
import AppSetup from './setup/AppSetup';
import PageSetup from './setup/PageSetup';
import ComponentSetup from './setup/ComponentSetup';

export default function useWatch() {
  checkSetupEnv('useWatch', ['app', 'page', 'component']);

  const type = useContextType();

  if (type === 'app') {
    const store = CommonSetup.getCurrent<AppSetup>().getStoreInstance()!;
    return store.watch.bind(store);
  }

  if (type === 'page') {
    const store = CommonSetup.getCurrent<PageSetup>().getStoreInstance()!;
    return store.watch.bind(store);
  }

  if (type === 'component') {
    const store = CommonSetup.getCurrent<ComponentSetup>().getStoreInstance()!;
    return store.watch.bind(store);
  }

  throw new Error('Unknown context.');
}
