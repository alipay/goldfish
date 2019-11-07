import PageSetup from './setup/PageSetup';
import ComponentSetup from './setup/ComponentSetup';
import AppSetup from './setup/AppSetup';

export default function useContextType() {
  const setup = PageSetup.getCurrent();
  if (!setup) {
    throw new Error('Can not get context type out of setup flow.');
  }

  if (setup instanceof PageSetup) {
    return 'page';
  }

  if (setup instanceof ComponentSetup) {
    return 'component';
  }

  if (setup instanceof AppSetup) {
    return 'app';
  }

  throw new Error('Unknown context.');
}
