import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import checkSetupEnv from './checkSetupEnv';

export default function useWatch() {
  checkSetupEnv('useWatch', ['app', 'page', 'component']);

  const type = useContextType();

  if (['app', 'page', 'component'].indexOf(type) > -1) {
    const setup = CommonSetup.getCurrent<CommonSetup<any, any>>();
    return setup.watch.bind(setup);
  }

  throw new Error('Unknown context.');
}
