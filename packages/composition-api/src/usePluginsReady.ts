import getAppStore from './getAppStore';
import checkSetupEnv from './checkSetupEnv';

export default function usePluginsReady() {
  checkSetupEnv('usePluginsReady', ['app', 'page', 'component']);
  const appStore = getAppStore();
  return () => appStore.waitForPluginsReady();
}
