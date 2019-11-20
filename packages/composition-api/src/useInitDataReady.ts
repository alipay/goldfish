import getAppStore from './getAppStore';
import checkSetupEnv from './checkSetupEnv';

export default function useInitDataReady() {
  checkSetupEnv('useInitDataReady', ['app', 'page', 'component']);

  const appStore = getAppStore();
  return () => appStore.waitForInitDataReady();
}
