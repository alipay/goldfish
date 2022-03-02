import checkSetupEnv from './checkSetupEnv';
import CommonSetup from './setup/CommonSetup';
import useWatch from './useWatch';

export default function useInitDataReady() {
  checkSetupEnv('useInitDataReady', ['app', 'page', 'component']);

  const watch = useWatch();

  const setup = CommonSetup.getCurrent<CommonSetup<any, any>>();
  return () => {
    return new Promise<void>(resolve => {
      const stop = watch(
        () => setup.compositionState.isInitLoading as boolean,
        isLoading => {
          if (isLoading) {
            resolve();
            stop();
          }
        },
        {
          immediate: true,
        },
      );
    });
  };
}
