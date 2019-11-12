# 全局插件管理模块

单独的全局插件管理模块。

::: warning
**注意：**

主要用于已存项目，新项目不要使用。
:::

## init()

* **说明：**

  生命周期方法，初始化全局插件管理模块。

## destroy()

* **说明：**

  生命周期方法，销毁全局插件管理模块。

## register(PluginClass)

* **参数：**

  * `{constructor} PluginClass`

* **返回值：**`{Promise<void>}`
* **说明：**

  注册插件，当返回的 Promise 对象 resolved 之后，则说明插件已被成功注册。

* **示例：**

  ```ts
  import { JSBridge, pluginHub } from '@alipay/goldfish';

  pluginHub.register(JSBridge);
  ```

## get(PluginClass)

* **参数：**

  * `{constructor} PluginClass`

* **返回值：**`{Promise<Plugin>}`
* **说明：**

  获取已注册的插件。如果没找到指定插件，该方法会抛出异常。

* **示例：**

  ```ts
  import { pluginHub, JSBridge } from '@alipay/goldfish';

  pluginHub.get(JSBridge).then(
    (bridgePlugin) => {
      // do something.
    },
  );
  ```
