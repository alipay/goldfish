import getAppStore from './getAppStore';

export default function usePluginsReady() {
  const appStore = getAppStore();
  return () => appStore.waitForPluginsReady();
}
