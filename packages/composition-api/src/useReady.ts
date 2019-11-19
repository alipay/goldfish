import getAppStore from './getAppStore';

export default function useReady() {
  const appStore = getAppStore();
  return () => appStore.waitForReady();
}
