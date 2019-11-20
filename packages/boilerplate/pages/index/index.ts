import { setupPage, useState, useFetchInitData } from '@goldfishjs/composition-api';

Page(setupPage(() => {
  const data = useState<{ name: string }>({
    name: 'zhangsan',
    get realName() {
      return `${this.name}.haha`;
    },
  });

  useFetchInitData(async () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  });

  setTimeout(() => {
    data.name = 'lisi';
  }, 3000);

  return {
    data,
  };
}));
