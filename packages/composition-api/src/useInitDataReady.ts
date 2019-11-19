import getAppStore from './getAppStore';

export default function useInitDataReady() {
  const appStore = getAppStore();
  return () => appStore.waitForInitDataReady();
}
