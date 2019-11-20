import { setupPage, useState, useFetchInitData, useGlobalData } from '@goldfishjs/composition-api';

Page(setupPage(() => {
  const globalData = useGlobalData();
  const data = useState<{ name: string }>({
    name: 'zhangsan',
    get realName() {
      return `${this.name}.haha`;
    },
    get globalName() {
      return globalData.get('globalName');
    },
  });

  useFetchInitData(async () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  });

  setTimeout(() => {
    data.name = 'lisi';
    globalData.set('globalName', '222');
  }, 3000);

  return {
    data,
  };
}));
