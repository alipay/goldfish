import AppStore from './connector/store/AppStore';

export default function getAppStore(): AppStore {
  return (getApp() as any).store;
}
