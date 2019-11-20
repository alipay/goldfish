import {
  setupPage,
  useState,
  useFetchInitData,
  useGlobalData,
  usePlugins,
  usePageLifeCycle,
  useReady,
} from '@goldfishjs/composition-api';

Page(setupPage(() => {
  const globalData = useGlobalData();
  const plugins = usePlugins();
  const ready = useReady();

  usePageLifeCycle('onLoad', async () => {
    await ready();
    plugins.feedback.addAlert({
      content: 'hahha',
    });
  });

  const data = useState({
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
