---
sidebarDepth: 3
---

# 工具函数

## 普通工具函数

### html2nodes(html)

* **参数：**

  * `{string} html`

* **返回值：**`Promise<string>`
* **说明：**

  将 `html` 字符串转换为 [rich-text](https://docs.alipay.com/mini/component/rich-text) 组件能用的 `nodes` 格式。

### isRichTextHasContent(html)

* **参数：**

  * `{string} html`

* **返回值：**`Promise<boolean>`
* **说明：**

  判断 `html` 字符串中是否存在用户可见的内容。

### rpx2px(value)

* **参数：**

  * `{number} value`

* **返回值：**`{Promise<number>}`
* **说明：**

  将 `rpx` 转换为 `px`。

### asyncForEach(arr, cb)

* **参数：**

  * `{Array} arr`
  * `{Function} cb`

* **返回值：**`{Promise<void>}`
* **说明：**

  异步迭代。

* **示例：**

  ```ts
  import { asyncForEach } from '@alipay/goldfish';

  function cb(item: any) {
    return new Promise((resolve) => {
      console.log(item);
      setTimeout(resolve);
    });
  }

  asyncForEach([1, 2, 3], cb)
    .then(() => {
      console.log('end');
    });

  // 依次输出：
  // 1
  // 2
  // 3
  // end
  ```

### cache(fn, options?)

* **参数：**

  * `{Function} fn`
  * `{Object} options?`
    * `{boolean} disableCache?` 默认值 `false`

* **返回值：**`{Function}`
* **说明：**

  缓存异步函数执行结果。

  如果上次异步执行还未拿到结果，就发起了下次异步执行请求，则会等到上次执行拿到结果之后，一并返回给下次异步执行结果。

  如果上次异步执行结果是成功的，那么后续的执行，都会返回这个成功的结果，直到整个应用销毁。

* **示例：**

  ```ts
  import { cache } from '@alipay/goldfish';

  let counter: number = 1;
  const cachedFn = cache(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(counter++);
      });
    });
  });

  (async () => {
    console.log(await cacheFn());
    console.log(await cacheFn());
    console.log(await cacheFn());
    // 输出：
    // 1
    // 1
    // 1
  })();
  ```

### silent(fn)

* **参数：**

  * `{Function} fn`

* **说明：**

  静默执行 `fn`，支持异步函数。当 `fn` 中抛出异常时，`silent()` 会在 console 打印出异常内容，而不会将异常抛出去。

### mapData(data, ...args)

* **参数：**

  * `{Object} data`
  * `{(string | Object)[]} args`

* **返回值：**`{Object}`
* **说明：**

  将响应式数据拆分成 `getters`，用于 `setupXXX` 函数中的返回值部分。

* **示例：**

  ```ts
  import { setupPage, mapData } from '@alipay/goldfish';

  Page(setupPage(
    () => {
      const data = useState({
        name: 'yujiang',
        age: 20,
        sex: 'male',
      });

      // 返回在模板中会使用到的数据和方法。
      return {
        ...mapData(
          data,
          'name',
          { age: 'age' },
          { sex: (d) => d.sex },
        ),
      };
    },
  ));
  ```

## Function API 工具函数

此类工具函数只能用于 `setup` 系列方法之中，并且是同步调用。

### useDevice(model?, requester?)

* **参数：**

  * `{string} model?`
  * `{Function} requester?`

* **返回值：**`{Object}`

* **说明：**

  获取设备配置信息，比如当前用户使用的设备系统是否有底部操作区、是否有刘海等等。返回的数据是响应式的。

  如果是在 `setupPage()` 同步流程中调用 `useDevice()`，则不需要传递 `model` 和 `requester` 参数，会使用从 `getSystemInfo()` API 中获取到的 `model` 设备标识，去 [device](https://basement.alipay.com/intlant_release/device/sprints) 区块数据中获取指定设备的配置信息。

  如果是在 `setupLocalPage()` 同步流程中调用 `useDevice()`，则必须传递 `model` 和 `requester` 参数。

### usePlugins(PluginClassList?)

* **参数：**

  * `{Array} PluginClassList?`

* **返回值：**`{Object}`
  * `{Object} bridge` JSBridge 插件
  * `{Object} route` 应用内路由插件
  * `{Object} feedback` 交互反馈插件
  * `{Object} requester` 数据请求插件
  * `{Object} trace` 业务埋点插件
  * `{Object} log` 日志插件

* **说明：**

  获取已注册的插件。

  如果不传参数，则获取所有内置插件。如果传入插件类，则获取各自类对应的插件对象，以 `Plugin.type` 为 key 返回指定插件对象。

* **示例：**

  ```ts {9,12}
  import { setupPage, usePlugins, Plugin, usePageLifeCycle } from '@alipay/goldfish';

  export class MyJSBridge {
    public static readonly type = 'myJSBridge';
  }

  Page(setupPage(() => {
    // 获取所有内置插件
    const allInnerPlugins = usePlugins();

    // 获取指定已注册插件
    const myPlugins = usePlugins([MyJSBridge]);

    usePageLifeCycle('onLoadReady', () => {
      myPlugins.myJSBridge;
    });

    return {};
  }));
  ```

### useContextType()

* **返回值：**`'page' | 'component' | 'localPage' | 'app'`
* **说明：**

  获取当前执行上下文的类型：
  * `page`：在 `setupPage()` 同步流程中；
  * `component`：在 `setupComponent()` 同步流程中；
  * `localPage`：在 `setupLocalPage()` 同步流程中；
  * `app`：在 `setupApp()` 同步流程中。

### useWatch()

* **返回值：**`{Function} watch`
* **说明：**

  获取 `watch()` 方法，可以用来监听响应式数据。当所在页面或者组件销毁的时候，会停止监听。

  参数与 [AppStore#watch()](../api/AppStore.html#watch-fn-cb-options) 一致。

### useAutorun()

* **返回值：**`{Function} autorun`
* **说明：**

  获取 `autorun()` 方法，作用和参数与 [AppStore#autorun()](../api/AppStore.html#autorun-fn-errorcb) 一致。当所在页面或者组件销毁的时候，会停止监听。

### useGlobalData()

* **返回值**`{Object} globalData`
* **说明：**

  获取全局数据。
