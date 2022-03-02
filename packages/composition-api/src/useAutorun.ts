import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import checkSetupEnv from './checkSetupEnv';

export default function useAutorun() {
  checkSetupEnv('useAutorun', ['app', 'page', 'component']);

  const type = useContextType();

  if (['app', 'page', 'component'].indexOf(type) > -1) {
    const setup = CommonSetup.getCurrent<CommonSetup<any, any>>();
    return setup.autorun.bind(setup);
  }

  throw new Error('Unknown context.');
}
