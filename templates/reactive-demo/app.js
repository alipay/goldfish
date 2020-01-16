import { setupApp, useState } from '@goldfishjs/composition-api';

App(setupApp({}, () => {
  const data = useState({
    name: 'Jack',
    age: 0,
  });

  const globalData = useState({
    get name() {
      return data.name;
    },
    get age() {
      return data.age;
    },
    get fullName() {
      return `${data.name}.Jan`;
    },
  });

  return globalData;
}));
