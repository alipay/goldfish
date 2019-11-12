# 数据请求插件

主要处理三种类型的请求：

* HTTP 请求；
* RPC 数据请求；
* 凤蝶区块数据请求。

如果全局配置中，`mock` 配置项为 `true`，数据请求将会被定向到指定服务器（`mockServer`）。

## requestTWA(api, params?, options?)

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

## requestH5Data(path, basementProjectName, options?)

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

## sendRequest(url)
