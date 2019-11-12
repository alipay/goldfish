---
sidebarDepth: 2
---

# 全局配置

在实例化应用的时候，可以针对特定的容器环境（dev、test、pre、prod）传入相应的全局应用配置。

## 分环境配置

可以针对特定环境提供配置：

```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {},
    test: {},
    pre: {},
    prod: {},
  };
  ```

默认情况下，会根据容器情况来判定环境，同时也提供了手动指定环境的能力：

```ts
import { ConfigOptions } from '@alipay/goldfish';

const config: ConfigOptions = {
  env: 'dev',
};
```

## 特定环境配置

每种环境下都可以配置如下项目。

### h5dataUrl

* **类型：**`string`
* **默认值：**`undefined`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      h5dataUrl: 'http://render-dev.site.alipay.net/p/h5data_offline/dev_{project}_{path}.json',
    },
  };
  ```

指定相应环境下，获取凤蝶区块数据的地址。其中 `{project}` 和 `{path}` 是占位符，`{project}` 表示凤蝶区块项目在 Basement 上的项目名，`{path}` 表示区块数据在项目中的路径。

### h5dataSchema

* **类型：**`{ [key: string]: Object }`
* **默认值：**`undefined`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      h5dataSchema: {
        'index-h5data': {
          properties: {
            smaller: { type: 'number' },
          },
        },
      },
    },
  };
  ```

对获取的凤蝶区块数据进行校验。`key` 表示区块数据路径，对应的值是一个 `JSON Schema`，其数据格式可参考 [ajv](https://ajv.js.org/)。

### twa

* **类型：**

  ```ts
  {
    appName: string;
    env: 'dev' | 'test' | 'pre' | 'prod';
    forward?: string;
    headers?: {
      [key: string]: string;
    };
    timeout?: number;
    basement?: boolean;
  }
  ```

* **默认值：**

  ```ts
  {
    appName: 'overseatwa',
    env: 'dev',
    forward: undefined,
    headers: undefined,
    timeout: undefined,
    basement: undefined,
  }
  ```

* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      twa: {
        appName: 'overseatwa',
        env: 'dev',
        forward: 'xxx',
        headers: { ... },
        timeout: 3000,
        basement: false,
      },
    },
  };
  ```

配置 TWA 请求，参考[此处](https://yuque.antfin-inc.com/basement/koi/rpc-client)。

### twaSchema

* **类型：**`{ [key: string]: Object }`
* **默认值：**`undefined`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      twaSchema: {
        'common.index.keyValueService': {
          properties: {
            smaller: { type: 'number' },
          },
        },
      },
    },
  };
  ```

对从 TWA 服务获取到的数据进行校验。`key` 表示接口名字，对应的值是一个 `JSON Schema`，其数据格式可参考 [ajv](https://ajv.js.org/)。

### mock

* **类型：**`boolean`
* **默认值：**`false`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      mock: true,
    },
  };
  ```

是否 mock TWA 接口和凤蝶区块数据。如果是 `true`，则需要通过 `mockServer` 配置 mock 服务。

### mockServer

* **类型：**`string`
* **默认值：**`undefined`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      mock: true,
      mockServer: 'http://127.0.0.1:3000',
    },
  };
  ```

配置 mock 服务。

### logBizType

* **类型：**`string`
* **默认值：**`undefined`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      logBizType: 'GlobalO2O',
    },
  };
  ```

向服务端发送前端日志时所携带的业务项目标识。

### defaultRequestShowLoading

* **类型：**`boolean`
* **默认值：**`true`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      defaultRequestShowLoading: true,
    },
  };
  ```

默认情况下，是否对 TWA 和凤蝶区块数据请求进行全局 loading 计数器计数。

### defaultRequestDelay

* **类型：**`number`
* **默认值：**`300`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      defaultRequestDelay: 300,
    },
  };
  ```

默认情况下，一个请求发出多长时间未收到响应时，对全局 loading 计数器加一。

### mockJSAPI

* **类型：**`boolean`
* **默认值：**`false`
* **用法：**

  ```ts
  import { ConfigOptions } from '@alipay/goldfish';

  const config: ConfigOptions = {
    dev: {
      mockJSAPI: true,
      mockServer: 'http://127.0.0.1:3000',
    },
  };
  ```

  配置对 JS API 的 mock。

  如上所示的配置，如果通过 [JSBridge 插件](./plugins.html#jsbridge-插件)调用 `startApp`，则会发送 GET 请求到 mockServer 指定的服务器，完整请求路径为：`http://127.0.0.1:3000/jsapi/startApp?[传给 startApp 的参数]`。

  如果请求这个地址发生了错误，则认为不需要 mock 该 JS API，转为调用真实的 JS API。
