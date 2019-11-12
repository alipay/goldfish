# JSBridge 插件

对容器 JS API 的封装，主要做以下提升：

1. 屏蔽底层容器 API 的 bug；
2. 屏蔽底层容器 API 的繁琐度；
3. 提供更加友好的 Promise 风格 API。

## pushWindow(url, params?)

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

## getCurrentLocation(options)

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

## getStartupParams(options?)

* **参数：**

  * `{Object} options?`

* **返回值：**`{Promise<Object>}`
* **说明：**

  对官方 API 的封装，参数和返回值格式都可以参考[官方文档](http://jsapi.alipay.net/jsapi/util/get-startup-params.html)。

## reportBizReady()

* **说明：**

  上报心跳，参考[文档](https://yuque.antfin-inc.com/hybridinspect/stargazer/heartbeats)。

  ::: tip
  在全局模块中，完成初始化之后，会调用一次该方法，不需要手动调用。
  :::

## getUserInfo()

* **说明：**

  获取用户信息，参考[文档](http://jsapi.alipay.net/jsapi/util/get-user-info.html)。

## getSystemInfo()

* **说明：**

  获取系统信息，参考[文档](https://docs.alipay.com/mini/api/system-info)。

## getNetworkType()

* **说明：**

  获取网络信息，参考[文档](https://docs.alipay.com/mini/api/network-status)。

## getStorageItem(key)

* **说明：**

  获取本地存储数据，底层使用的是 [my.getStorage](https://docs.alipay.com/mini/api/azfobl)。

## setStorageItem(key, value)

* **说明：**

  存储数据到本地，底层使用的是 [my.setStorage](https://docs.alipay.com/mini/api/eocm6v)。

## getCurrentUrl()

* **说明：**

  获取当前页面的 URL 地址，拿到的地址格式与 `app.json` 中配置的一样。

## callBridge(api, ...args?)

* **参数：**

  * `{string} api`
  * `{Array} args?`
    * `{Object | Function} args[0]`
    * `{Function} args[1]`

* **说明：**

  对 [my.call](https://docs.antfin.com/tinyapp/develop/api) 的封装。
