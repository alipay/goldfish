---
sidebarDepth: 2
---

# 页面

在小程序中，有[页面组件](https://docs.alipay.com/mini/framework/page)。

在本框架中，我们在页面组件的基础上封装了 [Function based API](https://zhuanlan.zhihu.com/p/68477600)。

## 标准页面

### setupPage(fn)

* **参数：**
  * `{Function} fn`

* **返回值：**`{PageOptions} options`

* **说明：**

  构造小程序页面的配置对象，同时提供获取页面相关 Function-based API 的执行环境 `fn`。

* **示例：**

  ```ts {3}
  import { setupPage } from '@alipay/goldfish';

  Page(setupPage(
    () => {
      // 在该函数的同步流程中，可以执行 Function-based API。

      // 返回在模板中会使用到的数据和方法。
      return {};
    },
  ));
  ```

### usePageLifeCycle(name, fn)

* **参数：**
  * `{string} name` 页面生命周期钩子的名字
  * `{Function} fn` 钩子函数

* **说明：**

  添加页面生命周期钩子函数。

  `fn()` 的参数会根据 `name` 来注入，比如 `name` 为 `onLoad` 时，`fn()` 会收到 `query` 参数。

  同时，针对每一个生命钩子函数 a，都会对应一个 `xxxReady()` 钩子函数 b，b 函数会在 a 函数执行之后，并且确保应用初始化完成之后，才会执行。

* **示例：**

  ```ts {5,12}
  import { usePageLifeCycle, setupPage } from '@alipay/goldfish';

  Page(setupPage(
    () => {
      usePageLifeCycle(
        'onLoad',
        () => {
          console.log('onLoad');
        },
      );

      usePageLifeCycle(
        'onLoadReady',
        () => {
          console.log('onLoadReady');
        },
      );

      return {};
    },
  ));
  ```

### useValue(value)

* **参数：**
  * `{boolean | undefined | null | number | string} value`

* **返回值：**`{Object} obj`
* **说明：**

  传入一个原始值，构造响应式的原始数据，返回值是一个带有 `value` 属性的对象 obj。

* **示例：**

  ```ts {5}
  import { useValue, setupPage } from '@alipay/goldfish';

  Page(setupPage(
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

  在页面模板中访问 `name`：

  ```html
  <view>{{ name.value }}</view>
  ```

### useState(obj)

* **参数：**
  * `{Object} obj`

* **返回值：**`{Object} obj`
* **说明：**

  传入一个对象，将其转换成响应式的对象。

* **示例：**

  ```ts {5-7}
  import { useState, setupPage } from '@alipay/goldfish';

  Page(setupPage(
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

  在页面模板中访问数据：

  ```html
  <view>{{ person.name }}</view>
  ```

### useComputed(obj)

* **参数：**
  * `{Object} obj`

* **返回值：**`{Object} obj`
* **说明：**

  传入一个带有 getter 或者 setter 的对象，将其转换成响应式的计算属性。

* **示例：**

  ```ts {9-13}
  import { useState, useComputed, setupPage } from '@alipay/goldfish';

  Page(setupPage(
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

  在页面模板中访问计算属性：

  ```html
  <view>{{ computed.fullName }}</view>
  ```

### useApp()

* **返回值：**`{AppStore} appStore`
* **说明：**

  获取全局模块 AppStore 对象。

* **示例：**

  ```ts {5}
  import { useApp, setupPage } from '@alipay/goldfish';

  Page(setupPage(
    () => {
      const appStore = useApp();

      return {};
    },
  ));
  ```

::: warning
大多数情况下，并不需要使用 `useApp()`。
:::

### useFetchInitData(fn, isAsync?)

* **参数：**
  * `{Function} fn`
  * `{boolean} isAsync?`

* **说明：**

  在页面获取初始化数据的时候执行 `fn()` 函数。在一个 `setupPage()` 的同步流程中，可以添加多个初始化函数。

  `isAsync` 为 `true` 时，则当前 `fn()` 与之前添加的函数是并行执行的，否则是串行执行。默认为 `true`。

* **示例：**

  ```ts {5-10}
  import { useFetchInitData, setupPage } from '@alipay/goldfish';

  Page(setupPage(
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

### usePageStore()

* **返回值：**`{PageStore} pageStore`
* **说明：**

  获取当前页面的 store。

  页面 store 上有 `isInitLoading` 数据成员，判断当前页面是否正在初始化。

* **示例：**

  ```ts {5}
  import { usePageStore, setupPage } from '@alipay/goldfish';

  Page(setupPage(
    () => {
      const store = usePageStore();

      return {};
    },
  ));
  ```

::: warning
大多数情况下，并不需要使用 `usePageStore()`。
:::

### useView()

* **返回值：**`{Page} page`
* **说明：**

  获取页面视图层实例。

* **示例：**

  ```ts {5}
  import { useView, setupPage } from '@alipay/goldfish';

  Page(setupPage(
    () => {
      const pageInstance = useView<tinyapp.IPageInstance>();

      return {};
    },
  ));
  ```

::: warning
大多数情况下，并不需要使用 `useView()`。
:::

## 渐进式页面

渐进式页面，即未与应用入口、全局配置、全局模块等内容相关联的页面，比较纯粹。

::: warning
**注意：**

主要方便已有项目快速接入 Goldfish，新项目不推荐使用。
:::

### setupLocalPage(fn, onError?)

* **参数：**

  * `{Function} fn`
  * `{Function} onError?`

* **返回值：**`{PageOptions} options`
* **说明：**

  `fn` 提供使用 Function-based API 的环境。

* **示例：**

  ```ts {3}
  import { setupLocalPage } from '@alipay/goldfish';

  Page(setupLocalPage(
    () => {
      // 在该函数的同步流程中，可以执行 Function-based API。

      // 返回在模板中会使用到的数据和方法。
      return {};
    },
  ));
  ```

### useValue(value)

参考标准页面的 [useValue()](./Page.html#usevalue-value)。

### useState(obj)

参考标准页面的 [useState()](./Page.html#usestate-obj)。

### useComputed(obj)

参考标准页面的 [useComputed()](./Page.html#usecomputed-obj)。

### usePageLifeCycle(name, fn)

参考标准页面的 [usePageLifeCycle()](./Page.html#usepagelifecycle-name-fn)。

### useView()

参考标准页面的 [useView()](./Page.html#useview)。
