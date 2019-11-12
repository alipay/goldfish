# 管理状态

在 Goldfish 中，存在两种状态数据：**全局状态数据**和**局部状态数据**。

**全局状态数据**由全局模块 `AppStore` 管理，其生命周期与小程序应用生命周期相同：在应用初始化的时候，调用 `AppStore#init()` 初始化全局模块，在应用销毁的时候，调用 `AppStore#destroy()` 销毁全局模块。

**局部状态数据**应用于页面和组件中，随着页面或组件的初始化而初始化、销毁而销毁。

Goldfish 中，状态数据是响应式的，关于响应式的原理，可以参考 [Vue.js 官方文档](https://cn.vuejs.org/v2/guide/reactivity.html)。

## 全局状态

在 `setupApp(config, fn, options?)` 流程中，`fn()` 的返回值即为全局状态：

```ts {3-7,12-29}
import { setupApp, useState, useComputed } from '@alipay/goldfish';

export interface IGlobalData {
  name: string;
  age: number;
  fullName: string;
}

App(
  {},
  () => {
    const data = useState<Pick<IGlobalData, 'name' | 'age'>>({
      name: '',
      age: 0,
    });

    const globalData: IGlobalData = useComputed({
      get name() {
        return data.name;
      },
      get age() {
        return data.age;
      },
      get fullName() {
        return `${data.name}.XXX`;
      },
    });

    return globalData;
  },
);
```

在 `setupApp()` 和 `setupPage()` 中，可以使用 `useGlobalData()` 获取全局数据：

```ts {5,8}
import { setupPage, usePageLifeCycle } from '@alipay/goldfish';
import { IGlobalData } from '../../app';

Page(setupPage(() => {
  const globalData = useGlobalData<IGlobalData>();

  usePageLifeCycle('onLoad', () => {
    const name = globalData.get('name');
  });

  return {};
}));
```

很多时候，我们可能期望构造一个比较聚合的全局数据，此时可以先定义一个具备响应式能力的类：

```ts
import { observable, state, computed } from '@alipay/goldfish';

@observable
class FormData {
  @state
  public name: string = '';

  @computed
  public get fullName() {
    return this.name;
  }
}
```

::: tip

* `@observable` 表示该类中有响应式数据成员，需要搜集处理。
* `@state` 表示该数据成员是响应式数据属性。
* `@computed` 表示该数据成员是响应式计算属性。

`@observable`、`@state`、`@computed` 可应用于任何类。

:::

然后在 `setupApp()` 中实例化：

```ts {11,13-15}
import { setupApp, useComputed } from '@alipay/goldfish';
import FormData from './FormData';

export interface IGlobalData {
  formData: FormData;
}

App(
  {},
  () => {
    const formData = new FormData();
    const globalData: IGlobalData = useComputed({
      get formData() {
        return formData;
      },
    });

    return globalData;
  },
);
```

## 局部状态

局部状态使用 Function-based API 进行管理，包括：

* `useValue()`
* `useState()`
* `useComputed()`

`useValue()` 将原始值变为响应式数据：

```ts {4,8}
import { setupPage, useValue } from '@alipay/goldfish';

Page(setupPage(() => {
  const counter = useValue<number>(1);

  setInterval(
    () => {
      counter.value += 1;
    },
    1000,
  );

  return {
    counter,
  };
}));
```

在对应的页面模板中访问 `counter`：

```html
<view>{{ counter.value }}</view>
```

`useState()` 将普通对象转换为响应式对象：

```ts {5,10}
import { setupPage, useState } from '@alipay/goldfish';

Page(setupPage(() => {
  const data = useState({
    name: 'diandao',
  });

  setTimeout(
    () => {
      data.name = 'yujiang';
    },
    1000,
  );

  return {
    data,
  };
}));
```

在对应的页面模板中访问 `data`：

```html
<view>{{ data.name }}</view>
```

`useComputed()` 将 `getter/setter` 对象转变为拥有计算属性的对象：

```ts {9-11}
import { setupPage, useState, useComputed } from '@alipay/goldfish';

Page(setupPage(() => {
  const data = useState({
    name: 'diandao',
  });

  const computed = useComputed({
    get fullName() {
      return `${data.name}.ant`;
    },
  });

  setTimeout(
    () => {
      data.name = 'yujiang';
    },
    1000,
  );

  return {
    computed,
  };
}));
```

在对应的页面模板中访问 `computed`：

```html
<view>{{ computed.fullName }}</view>
```

::: warning

`useValue()`、`useState()`、`useComputed()` 返回的对象均是一个整体，如果要保证响应式链路不会断掉，数据传递的时候不要将整体拆分。

如下示例就会导致 `data.name` 的变更不会同步到模板中去：

```ts {10,16}
import { setupPage, useState } from '@alipay/goldfish';

Page(setupPage(() => {
  const data = useState({
    name: 'diandao',
  });

  setTimeout(
    () => {
      data.name = 'yujiang';
    },
    1000,
  );

  return {
    name: data.name,
  };
}));
```

:::

局部响应式数据可以被监听：

```ts {8-15,17-20}
import { setupPage, useState, useWatch, useAutorun } from '@alipay/goldfish';

Page(setupPage(() => {
  const data = useState<{ name: string }>({
    name: 'diandao',
  });

  const watch = useWatch();
  watch(
    () => data.name,
    (newVal) => console.log(newVal),
    {
      immediate: true,
    },
  );

  const autorun = useAutorun();
  autorun(() => {
    console.log(data.name);
  });

  setTimeout(
    () => {
      data.name = 'yujiang';
    },
    1000,
  );

  return {
    data,
  };
}));
```

在“局部范围”内，也可以拿到全局状态：

```ts {5,9}
import { setupPage, useComputed, useGlobalData } from '@alipay/goldfish';
import { IGlobalData } from '../../app';

Page(setupPage(() => {
  const globalData = useGlobalData<IGlobalData>();

  const computed = useComputed({
    get globalName() {
      return globalData.get('name');
    },
  });

  return {
    computed,
  };
}));
```
