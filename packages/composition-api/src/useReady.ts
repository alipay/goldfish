import getAppStore from './getAppStore';
import checkSetupEnv from './checkSetupEnv';

export default function useReady() {
  checkSetupEnv('useReady', ['app', 'page', 'component']);
  const appStore = getAppStore();
  return () => appStore.waitForReady();
}
