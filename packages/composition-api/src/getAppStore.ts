import { AppStore } from '@goldfishjs/core';

export default function getAppStore(): AppStore {
  return (getApp() as any).store;
}
