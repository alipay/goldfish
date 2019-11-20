import useContextType from './useContextType';
import CommonSetup from './setup/CommonSetup';
import { AppStore } from '@goldfishjs/core';

export default function getAppStore(): AppStore {
  const context = useContextType();
  const store = CommonSetup.getCurrent<CommonSetup<any>>().getStoreInstance();
  return context === 'app' ? store as any : (store as any).globalStore;
}
