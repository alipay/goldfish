---
sidebarDepth: 2
---

# 插件

在全局模块 `AppStore` 中，提供了插件管理功能（`pluginHub`）。

使用者可以注册自己的插件，也可以使用内置的插件：[JSBridge 插件](#jsbridge-插件)、[交互反馈插件](#feedback-交互反馈插件)、[日志插件](#log-日志插件)、[数据请求插件](#requester-数据请求插件)、[应用内路由插件](#route-应用内路由插件)、[业务埋点插件](#trace-业务埋点插件)。

内部插件可以通过 `usePlugins` 访问。

```js
import { setupPage, usePlugins } from '@alipay/goldfish';

...

setupPage(() => {
  const plugins = usePlugins();

  // 调用插件 API
  plugins.bridge.getCurrentUrl();
});

...

```

[[toc]]

## 插件管理

### register(PluginClass)

* **参数：**

  * `{constructor} PluginClass`

* **返回值：**`{Promise<void>}`
* **说明：**

  注册插件。

  插件应当是一个继承自 `Plugin` 的类。

  在应用初始化的时候，会初始化已经注册的插件。也可以在初始化完毕之后注册插件，此时当插件注册并初始化完成之后，`register()` 返回的 `promise` 对象才会变为 `resolved` 状态。

* **示例：**

  ```ts {3,11}
  import { AppStore, Plugin } from '@alipay/goldfish';

  class MyPlugin extends Plugin {
    public static readonly type = 'MyPlugin';

    public destroy() {}
  }

  export default class BizAppStore extends AppStore {
    public async registerMyPlugins() {
      await this.pluginHub.register(MyPlugin);
      // 注册插件并初始化完毕
    }
  }
  ```

::: tip
如果想在全局模块 `AppStore` 初始化的时候，完成自定义插件初始化，或者覆盖内置插件，可以在 `AppStore#getPlugins()` 钩子函数中返回所有插件类。
:::

### get(PluginClass)

* **参数：**

  * `{string | constructor} PluginClass`

* **返回值：**`{IModule} plugin`
* **说明：**

  根据插件类型或者插件类，获取第一个已注册的插件对象。

* **示例：**

  ```ts {16,20}
  import { AppStore, Plugin } from '@alipay/goldfish';

  class MyPlugin extends Plugin {
    public static readonly type = 'MyPlugin';

    public destroy() {}
  }

  export default class BizAppStore extends AppStore {
    public async registerMyPlugins() {
      await this.pluginHub.register(MyPlugin);
      // 注册插件并初始化完毕
    }

    public getPluginByClass() {
      return this.pluginHub.get(MyPlugin);
    }

    public getPluginByType() {
      return this.pluginHub.get<MyPlugin>('MyPlugin');
    }
  }
  ```

## 插件基类 `Plugin`

插件有统一的基类 `Plugin`，每个插件都应当继承自该类。

```ts {3}
import { Plugin } from '@alipay/goldfish';

class MyPlugin extends Plugin {
  public static readonly type = 'MyPlugin';
  public destroy() {}
}
```

### type

* **类型：**`string`
* **说明：**

  `type` 数据成员表明插件的类型，一个应用应当只能存在某一种类型的插件。

### init(getPlugin)

* **参数：**

  * `{Function} getPlugin` 获取其它兄弟插件实例

* **返回值：**`{Promise<void>}`

* **说明：**

  生命周期方法，初始化插件。

* **示例：**

  ```ts {8-9}
  import { Plugin, Plugin, ILog, JSBridge } from '@alipay/goldfish';

  class MyPlugin extends Plugin {
    public static readonly type = 'MyPlugin';

    public async init(getPlugin: GetPlugin) {
      super.init(getPlugin);
      const log = getPlugin<ILog & IModule>('log');
      const bridge = getPlugin(JSBridge);
    }

    public destroy() {}
  }
  ```

### destroy()

* **说明：**

  生命周期方法，销毁实例。

## 全局插件管理模块

单独的全局插件管理模块。

::: warning
**注意：**

主要用于已存项目，新项目不要使用。
:::

### init()

* **说明：**

  生命周期方法，初始化全局插件管理模块。

### destroy()

* **说明：**

  生命周期方法，销毁全局插件管理模块。

### register(PluginClass)

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

### get(PluginClass)

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

## JSBridge 插件

对容器 JS API 的封装，主要做以下提升：

1. 屏蔽底层容器 API 的 bug；
2. 屏蔽底层容器 API 的繁琐度；
3. 提供更加友好的 Promise 风格 API。

### pushWindow(url, params?)

* **参数：**

  * `{string} url`
  * `{Object} params`

* **返回值：**`{Promise<void>}`
* **说明：**

  跳转内部 H5 页面或者应用，包括凤蝶页、离线包应用、小程序应用等。跳转成功之后，返回的 Promise 对象变为 resolved。

  跳转的时候，会带上全局配置中的 `chInfo` 参数；如果没有配置 `chInfo` 参数，但是配置了 `appId` 参数，则使用 `appId` 构造 `chInfo` 参数：`ch_[appId]`；否则，不带 `chInfo` 参数。

* **示例：**

  ```ts {6}
  import { setupPage, usePlugins } from '@alipay/goldfish';

  Page(setupPage(() => {
    const plugins = usePlugins();
    plugins.bridge.pushWindow('https://render.alipay.com/p/f/fd-jx2w06zl/index.html?chInfo=ch_internal__chsub_huodongyemian__zidingyi_pmp_mp');
    return {};
  }));
  ```

### getCurrentLocation(options)

* **参数：**

  * `{Object} options`

* **返回值：**`{Promise<Object>} location`
* **说明：**

  获取定位。

  `options` 参数参考[官方 API](https://docs.alipay.com/mini/api/mkxuqd#upyir)。

  返回的定位信息格式参考[官方 API](https://docs.alipay.com/mini/api/mkxuqd#success-%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0)。

  ::: tip
  如果当前页面参数上携带了定位信息，则此处会直接返回该定位信息，这样做主要是为了方便程序化地在多台设备上跑兼容性测试。
  :::

### getStartupParams(options?)

* **参数：**

  * `{Object} options?`

* **返回值：**`{Promise<Object>}`
* **说明：**

  对官方 API 的封装，参数和返回值格式都可以参考[官方文档](http://jsapi.alipay.net/jsapi/util/get-startup-params.html)。

### reportBizReady()

* **说明：**

  上报心跳，参考[文档](https://yuque.antfin-inc.com/hybridinspect/stargazer/heartbeats)。

  ::: tip
  在全局模块中，完成初始化之后，会调用一次该方法，不需要手动调用。
  :::

### getUserInfo()

* **说明：**

  获取用户信息，参考[文档](http://jsapi.alipay.net/jsapi/util/get-user-info.html)。

### getSystemInfo()

* **说明：**

  获取系统信息，参考[文档](https://docs.alipay.com/mini/api/system-info)。

### getNetworkType()

* **说明：**

  获取网络信息，参考[文档](https://docs.alipay.com/mini/api/network-status)。

### getStorageItem(key)

* **说明：**

  获取本地存储数据，底层使用的是 [my.getStorage](https://docs.alipay.com/mini/api/azfobl)。

### setStorageItem(key, value)

* **说明：**

  存储数据到本地，底层使用的是 [my.setStorage](https://docs.alipay.com/mini/api/eocm6v)。

### getCurrentUrl()

* **说明：**

  获取当前页面的 URL 地址，拿到的地址格式与 `app.json` 中配置的一样。

### callBridge(api, ...args?)

* **参数：**

  * `{string} api`
  * `{Array} args?`
    * `{Object | Function} args[0]`
    * `{Function} args[1]`

* **说明：**

  对 [my.call](https://docs.antfin.com/tinyapp/develop/api) 的封装。

## Feedback 交互反馈插件

管理全局的 alert、toast、confirm、prompt 弹窗。

为了避免同一个时刻弹出多个全局弹窗，本模块做了可选的“串行”控制：前一个弹窗未消失之前，下一个弹窗不会弹出。

### addToast(options)

* **参数：**

  * `{Object} options`
    * `{number} duration?` 显示时长，单位为 ms，默认 2000
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 toast 弹窗。

### addAlert(options)

* **参数：**

  * `{Object} options`
    * `{string} title?` 标题
    * `{string} buttonText?` 按钮文字，默认为“确定”
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 alert 弹窗。

### addConfirm(options)

* **参数：**

  * `{Object} options`
    * `{string} title?` 标题
    * `{string} okButtonText?` 确认按钮文字，默认为“确定”
    * `{string} cancelButtonText?` 取消按钮文字，默认为“取消”
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 confirm 弹窗。

### addPrompt(options)

* **参数：**

  * `{Object} options`
    * `{string} title?` 标题
    * `{string} okButtonText?` 确认按钮文字，默认为“确定”
    * `{string} cancelButtonText?` 取消按钮文字，默认为“取消”
    * `{string} content?` 内容
    * `{Function} complete?` 显示结束后的回调函数
    * `{boolean} isBlock?` 是否阻塞下一个弹窗

* **说明：**

  显示 prompt 弹窗。


## Requester 数据请求插件

主要处理三种类型的请求：

* HTTP 请求；
* RPC 数据请求；
* 凤蝶区块数据请求。

如果全局配置中，`mock` 配置项为 `true`，数据请求将会被定向到指定服务器（`mockServer`）。

### requestTWA(api, params?, options?)

* **参数：**

  * `{string} api` 要请求的 TWA 接口地址
  * `{Object} params?` 请求参数
  * `{Object} options?`
    * `{boolean} showLoading?` 是否展示加载效果
    * `{number} delay?` 延迟多长时间才展示加载效果
    * `{boolean} needAuthorized?` 是否需要登录验证
    * `{number} timeout?` 请求超时时间
    * `{string} forward?` 将请求定位到指定的机器

* **返回值：**`{Promise<T>}`
* **说明：**

  请求 TWA 应用接口。

* **示例：**

  ```ts {8}
  import { setupPage, usePlugins, usePageLifeCycle } from '@alipay/goldfish';

  Page(() => {
    const plugins = usePlugins();

    usePageLifeCycle('onLoadReady', async () => {
      const res = await plugins.requester.requestTWA<IListResponse>('passion.index.list');
    });

    return {};
  });
  ```

### requestH5Data(path, basementProjectName, options?)

* **参数：**

  * `{string} path` schema 文件在项目中的路径
  * `{string} basementProjectName` 对应 Basement 上凤蝶区块项目名称
  * `{Object} options?`
    * `{boolean} showLoading?` 是否展示加载效果
    * `{number} delay?` 延迟多长时间才展示加载效果

* **说明：**

  请求凤蝶区块数据。

* **示例：**

  ```ts {8}
  import { setupPage, usePlugins, usePageLifeCycle } from '@alipay/goldfish';

  Page(() => {
    const plugins = usePlugins();

    usePageLifeCycle('onLoadReady', async () => {
      const res = await plugins.requester.requestH5Data<IConfigData>('config-h5data', 'device');
    });

    return {};
  });
  ```

### sendRequest(url)

* **参数：**

  * `{string} url` HTTP 请求地址

* **说明：**

  发送 HTTP GET 请求到指定地址，不在乎响应结果。

## Route 应用内路由插件

处理应用内的路由跳转。

### path

* **类型：**`{string}`
* **说明：**

  小程序当前页面的地址，格式与 `app.json` 中配置的 pages 一致。

### query

* **类型：**`{Object}`
* **说明：**

  小程序当前页面所携带的参数，与 [Page#onLoad](https://docs.alipay.com/mini/framework/page-detail#onloadquery-object) 中传入 query 参数一致。

### redirect(url, params?)

* **参数：**

  * `{string} url`
  * `{Object} params`

* **说明：**

  关闭当前页面，进入到 `url` 参数指定的页面。

### back(n, defaultUrl?)

* **参数：**

  * `{number} n`
  * `{string} defaultUrl?`

* **说明：**

  删除页面堆栈栈顶 `n` 个元素，然后跳转到当前栈顶标识的页面。如果 `n` 大于等于数组长度，那么会跳转到 `defaultUrl` 所示地址（默认 `/`），压入页面栈。

### backTo(url, options?)

* **参数：**

  * `{string} url`
  * `{Object} options`
    * `{number} removeStackLength`
    * `{Object} params`

* **说明：**

  从页面堆栈栈顶开始，删除 `options.removeStackLength` 个元素，如果 `options.removeStackLength` 超过页面堆栈长度，则会移除所有元素。移除结束后，使用 `url` 与 `options.params` 整合成新的页面地址，跳转至该地址，并压入页面栈。

### replace(url, params?)

* **参数：**

  * `{string} url`
  * `{Object} params?`

* **说明：**

  移除页面堆栈中所有元素，将当前页面地址置为 url 和 params 所标识的页面地址，并压入页面堆栈。

### pushWindow(url, params?)

* **参数：**

  * `{string} url`
  * `{Object} params?`

* **说明：**

  新建“标签页”，将其地址置为 `url` 和 `params` 所标识的地址。

### popWindow()

* **说明：**

  删除当前“标签页”，回到上一个“标签页”。如果没有“上一个标签页”，则返回到首页。

### popTo(delta)

* **参数：**

  * `{number} delta`

* **说明：**

  删除 delta 个“标签页”。如果溢出，则返回到首页。

## Trace 业务埋点插件

上报业务埋点。

### logPv(spmb, params?)

* **参数：**

  * `{string} spmb`
  * `{Object} params?`

* **说明：**

  切换 b 位，可以附带 `params` 作为参数。

### before(name, hookFn)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/gr89zc#before)。

### call(methodName, ...args)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#u8guue)。

### report(params)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#kwaeml)。

### get(key)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#sgzbbs)。

### set(config)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#qls5yx)。

### click(spmId, extraParams?)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#3n56mz)。

### expo(spmId, extraParams?)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#fyugez)。

### pageState(name)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#5bghrf)。

### info(params)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#wkcscg)。

### parse(value)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#9d9yrl)。

### stringify(value)

* **说明：**

  参考[文档](https://yuque.antfin-inc.com/tracert/3.0/sv87oe#2qy2xa)。

## Log 日志插件

日志模块管理前端日志，可以将前端日志发送到指定服务器。

在本地开发时，日志会打印到控制台；部署之后，会将日志发送给服务器。当然，也可以实现自己的日志类，在线上环境不发送任何日志信息。

### log(msg)

* **参数：**

  * `{string} msg`

* **说明：**

  输出 log 级别的日志。

### warn(msg)

* **参数：**

  * `{string | Error} msg`

* **说明：**

  输出 warn 级别的日志。

### debug(msg)

* **参数：**

  * `{string | Error} msg`

* **说明：**

  输出 debug 级别的日志。

### error(msg)

* **参数：**

  * `{string | Error} msg`

* **说明：**

  输出 error 级别的日志。

### reportDuration(type, name, fn)

* **参数：**

  * `{'h5' | 'rpc' | 'h5data'} type`
  * `{string} name`
  * `{() => Promise<R>} fn`

* **返回值：**`Promise<R>`

* **说明：**

  输出 `fn` 调用耗时日志，并会附带上一系列系统信息。
