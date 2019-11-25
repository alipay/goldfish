import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import checkSetupEnv from './checkSetupEnv';
import AppSetup from './setup/AppSetup';
import ComponentSetup from './setup/ComponentSetup';
import PageSetup from './setup/PageSetup';

export default function useAutorun() {
  checkSetupEnv('useAutorun', ['app', 'page', 'component']);

  const type = useContextType();

  if (type === 'app') {
    const store = CommonSetup.getCurrent<AppSetup>().getStoreInstance()!;
    return store.autorun.bind(store);
  }

  if (type === 'page') {
    const store = CommonSetup.getCurrent<PageSetup>().getStoreInstance()!;
    return store.autorun.bind(store);
  }

  if (type === 'component') {
    const store = CommonSetup.getCurrent<ComponentSetup>().getStoreInstance()!;
    return store.autorun.bind(store);
  }

  throw new Error('Unknown context.');
}
