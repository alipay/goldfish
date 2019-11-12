---
sidebarDepth: 2
---

# App

在小程序中，有 App 实例。一个小程序对应唯一一个 App 实例，用于管理所有页面和全局数据。

在本框架中，我们在 App 的基础上封装了 [Function-based API](https://zhuanlan.zhihu.com/p/68477600)。

## setupApp(config, fn, options)

* **参数：**

  * `{Object} config` [全局配置](../api/globalConfig.html)
  * `{Function} fn`
  * `{Object} options?`
    * `{Function} onBeforeStart?` 应用初始化之前触发
    * `{Function} onAfterStart?` 应用完成初始化时触发
    * `{Function} onGlobalLoading?` “是否存在全局加载”状态发生变化时触发
    * `{Array} plugins?` 注册插件，如果传入该参数，则所有内置插件都不会注册，只会注册此处传入的插件

* **返回值：**`{AppOptions} options`
* **说明：**

  构造小程序应用的配置对象，同时提供获取应用相关 Function-based API 的执行环境 `fn`。

  `fn()` 返回的是全局数据。

* **示例：**

  ```ts {9}
  import { setupApp, useComputed } from '@alipay/goldfish';

  export interface IGlobalData {}

  const config: IConfigOptions = {};
  const options = {};

  App(
    setupApp(
      config,
      () => {
        const globalData: IGlobalData = useComputed({});
        return globalData;
      },
      options,
    ),
  );
  ```

## useAppLifeCycle(name, fn)

* **参数：**
  * `{string} name` 应用生命周期钩子的名字
  * `{Function} fn` 钩子函数

* **说明：**

  添加应用生命周期钩子函数。

  `fn()` 的参数会根据 `name` 来注入，比如 `name` 为 `onLaunch` 时，`fn()` 会收到 `options` 参数。

* **示例：**

  ```ts {14}
  import { setupApp, useComputed, useAppLifeCycle } from '@alipay/goldfish';

  export interface IGlobalData {}

  const config: IConfigOptions = {};
  const options = {};

  App(
    setupApp(
      config,
      () => {
        const globalData: IGlobalData = useComputed({});

        usePageLifeCycle('onLaunch', () => {});

        return {};
      },
      options,
    ),
  );
  ```

## useApp()

* **返回值：**`{AppStore} appStore`
* **说明：**

  获取全局 AppStore 对象。

* **示例：**

  ```ts
  import { setupApp, useComputed, useApp } from '@alipay/goldfish';

  export interface IGlobalData {}

  const config: IConfigOptions = {};
  const options = {};

  App(
    setupApp(
      config,
      () => {
        const globalData: IGlobalData = useComputed({});

        const app = useApp();

        return globalData;
      },
      options,
    ),
  );
  ```

::: warning
大多数情况下，并不需要使用 `useApp()`。
:::

## useValue(value)

* **参数：**
  * `{boolean | undefined | null | number | string} value`

* **返回值：**`{Object} obj`
* **说明：**

  传入一个原始值，构造响应式的原始数据，返回值是一个带有 `value` 属性的对象 obj。

* **示例：**

  ```ts {6,9}
  import { useValue, setupApp } from '@alipay/goldfish';

  App(setupApp(
    {},
    () => {
      const name = useValue('diandao');

      setTimeout(() => {
        name.value = 'diandao.zl';
      });

      return {
        name,
      };
    },
  ));
  ```

## useState(obj)

* **参数：**
  * `{Object} obj`

* **返回值：**`{Object} obj`
* **说明：**

  传入一个对象，将其转换成响应式的对象。

* **示例：**

  ```ts {6-8,11}
  import { useState, setupApp } from '@alipay/goldfish';

  App(setupApp(
    {},
    () => {
      const person = useState({
        name: 'diandao',
      });

      setTimeout(() => {
        person.name = 'diandao.zl';
      });

      // 注意这里必须返回整个 useState() 的返回值 `person`，不然响应式链路会断掉。
      return {
        person,
      };
    },
  ));
  ```

## useComputed(obj)

* **参数：**
  * `{Object} obj`

* **返回值：**`{object} obj`
* **说明：**

  传入一个带有 getter 或者 setter 的对象，将其转换成响应式的计算属性。

* **示例：**

  ```ts {10-14}
  import { useState, useComputed, setupApp } from '@alipay/goldfish';

  App(setupApp(
    {},
    () => {
      const person = useState({
        name: 'diandao',
      });

      const computed = useComputed({
        get fullName() {
          return `${person.name}.zl`;
        },
      });

      return {
        computed,
      };
    },
  ));
  ```

## useFetchInitData(fn, isAsync?)

* **参数：**
  * `{Function} fn`
  * `{boolean} isAsync?`

* **说明：**

  在应用获取初始化数据的时候执行 `fn()` 函数。在一个 `setupApp()` 的同步流程中，可以添加多个初始化函数。

  `isAsync` 为 `true` 时，则当前 `fn()` 与之前添加的函数是并行执行的，否则是串行执行。默认为 `true`。

* **示例：**

  ```ts {6-11}
  import { useFetchInitData, setupApp } from '@alipay/goldfish';

  App(setupApp(
    {},
    () => {
      useFetchInitData(
        async () => {
          // 获取初始数据
        },
        false,
      );

      return {};
    },
  ));
  ```
