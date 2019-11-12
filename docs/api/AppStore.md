# 全局数据和插件

一个应用入口对应一个全局模块 `AppStore`。

`AppStore` 涵盖两块功能：

* 对应到应用层级的全局数据管理；
* 集成插件，包括 JSBridge、路由、数据请求模块等等。

## isInitLoading

* **类型：**`boolean`
* **说明：**

  应用是否处在初始化加载中，当 `AppStore#init()` 和 `AppStore#fetchInitData()` 执行完成之后变为 `false`。

## isGlobalLoading

* **类型：**`boolean`
* **说明：**

  当前是否有能触发 loading 效果的全局数据请求。

## feedback

* **类型：**`IFeedback`
* **说明：**

  参考 [Feedback 交互反馈插件](../api/plugins.html#feedback-%E4%BA%A4%E4%BA%92%E5%8F%8D%E9%A6%88%E6%8F%92%E4%BB%B6)。

## firstFeedback

* **类型：**`IToastOption | IAlertOption | IPromptOption | IConfirmOption | undefined`
* **说明：**

Feedback 队列中第一个元素。关于 Feedback，参考 [Feedback 交互反馈插件](../api/plugins.html#feedback-%E4%BA%A4%E4%BA%92%E5%8F%8D%E9%A6%88%E6%8F%92%E4%BB%B6)。

## pluginHub

* **类型：**`PluginHub`
* **说明：**

  参考[插件模块](./plugins.html#%E6%8F%92%E4%BB%B6%E7%AE%A1%E7%90%86)。

## log

* **类型：**`ILog`
* **说明：**

  参考 [Log 日志插件](./plugins.html#log-%E6%97%A5%E5%BF%97%E6%8F%92%E4%BB%B6)。

## requester

* **类型：**`IRequester`
* **说明：**

  参考 [Requester 数据请求插件](./plugins.html#requester-%E6%95%B0%E6%8D%AE%E8%AF%B7%E6%B1%82%E6%8F%92%E4%BB%B6)。

## route

* **类型：**`IRoute`
* **说明：**

  参考 [Route 应用内路由插件](./plugins.html#route-%E5%BA%94%E7%94%A8%E5%86%85%E8%B7%AF%E7%94%B1%E6%8F%92%E4%BB%B6)。

## trace

* **类型：**`ITrace`
* **说明：**

  参考 [Trace 业务埋点插件](./plugins.html#trace-%E4%B8%9A%E5%8A%A1%E5%9F%8B%E7%82%B9%E6%8F%92%E4%BB%B6)。

## bridge

* **类型：**`IBridge`
* **说明：**

  见 [JSBridge 插件](./plugins.html#jsbridge-%E6%8F%92%E4%BB%B6)。

## init()

* **返回值：**`Promise<void>`
* **用法：**

  生命周期方法，初始化应用。子类可以覆盖该方法，增加自己的初始化逻辑。

* **示例：**

  ```ts
  import { AppStore } from '@alipay/goldfish';
  import BizJSBridge from './BizJSBridge';

  export default class BizAppStore extends AppStore {
    public async init() {
      // 注册业务项目自己的 JS Bridge。
      this.pluginHub.register(BizJSBridge);

      await super.init();
    }
  }
  ```

## fetchInitData()

* **返回值：**`Promise<void>`
* **用法：**

  获取应用初始数据。子类可以覆盖该方法，获取其它初始数据。在 `AppStore#init()` 结束之后被调用。

* **示例：**

  ```ts
  import { AppStore } from '@alipay/goldfish';

  export default class BizAppStore extends AppStore {
    public rate?: IRate;

    public async fetchInitData() {
      await super.fetchInitData();
      this.rate = await this.requestTWA('passion.index.rate');
    }
  }
  ```

## addAlert(options)

* **参数：**

  * `options`

    ```ts
    {
      title?: string;
      content?: string;
      buttonText?: string;
      complete?: () => void;
      isBlock?: boolean;
    }
    ```

* **用法：**

  弹出 Alert 框，详情见 [Feedback 交互反馈模块](./plugins.html#feedback-%E4%BA%A4%E4%BA%92%E5%8F%8D%E9%A6%88%E6%8F%92%E4%BB%B6)。

## addConfirm(options)

* **参数：**

  * `options`

    ```ts
    {
      content?: string;
      title?: string;
      okButtonText?: string;
      cancelButtonText?: string;
      complete?: (result: {
          ok?: boolean;
          cancel?: boolean;
      }) => void;
      isBlock?: boolean;
    }
    ```

* **用法：**

  弹出 Confirm 框，详情见 [feedback 模块](./feedback)。

## addPrompt(options)

* **参数：**

  * `options`

    ```ts
    {
      content?: string;
      title?: string;
      okButtonText?: string;
      cancelButtonText?: string;
      complete?: (result: {
          ok?: boolean;
          cancel?: boolean;
      }) => void;
      isBlock?: boolean;
    }
    ```

* **用法：**

  弹出 Prompt 框，详情见 [Feedback 交互反馈插件](./plugins.html#feedback-%E4%BA%A4%E4%BA%92%E5%8F%8D%E9%A6%88%E6%8F%92%E4%BB%B6)。

## addToast(options)

* **参数：**

  * `options`

    ```ts
    {
      type?: 'none' | 'success' | 'fail' | 'exception';
      duration?: number;
      content?: string;
      complete?: () => void;
      isBlock?: boolean;
    }
    ```

* **用法：**

  弹出 toast，详情见 [Feedback 交互反馈插件](./plugins.html#feedback-%E4%BA%A4%E4%BA%92%E5%8F%8D%E9%A6%88%E6%8F%92%E4%BB%B6)。

## autorun(fn, errorCb)

* **参数：**

  * `{Function} fn`
  * `{Function} errorCb`

* **返回值：**`{Function} stop`

* **用法：**

  先执行一遍 `fn`，监听 `fn` 函数中的响应式数据，当其发生变化的时候，再次执行 `fn`，如此往复。当执行 `fn` 的时候出现了错误，则会触发 `errorCb` 回调函数，并传入错误对象。

  返回值 `stop()` 函数可用于停止监听 `fn` 函数中的响应式数据。

  在当前 `AppStore` 被销毁时，会停止所有本实例 `autorun()` 产生的监听行为。

  更多内容可查看响应式模块。

* **示例：**

  ```ts
  import { AppStore, observable, state } from '@alipay/goldfish';

  @observable
  export default class BizAppStore extends AppStore {
    @state
    public name = 'diandao';

    public async init() {
      await super.init();

      const stop = this.autorun(
        () => {
          if (this.name === 'diandao.zl') {
            stop();
          }
        },
        (error) => {
          console.error(`There is something wrong: ${JSON.stringify(error)}`);
        },
      );
    }
  }
  ```

## watch(fn, cb, options?)

* **参数：**

  * `{Function} fn`
  * `{Function} cb`
  * `{Object} options?`
    * `{boolean} deep?`
    * `{boolean} immediate?`
    * `{Function} onError?`

* **返回值：**`{Function} stop`

* **用法：**

  当 `fn` 中响应式数据发生变化时，观察 `fn` 中返回的值是否发生变化，如果变了，则触发 `cb` 回调函数，同时传入新值和旧值。

  返回值 `stop()` 函数可用于停止监听 `fn` 函数中的响应式数据。

  在当前 `AppStore` 被销毁时，会停止所有本实例 `watch()` 产生的监听行为。

  更多内容可查看响应式模块。

* **示例：**

  ```ts
  import { AppStore, observable, state } from '@alipay/goldfish';

  @observable
  export default class BizAppStore extends AppStore {
    @state
    public name = 'diandao';

    public async init() {
      await super.init();

      const stop = this.watch(
        () => this.name,
        (newVal, oldVal) => {
          if (newVal === 'diandao.zl') {
            stop();
          }
        },
        {
          onError: (error) => {
            console.error(`There is something wrong: ${JSON.stringify(error)}`);
          }
        },
      );
    }
  }
  ```

* **选项：deep**

  为了发现对象内部值的变化，可以在选项参数中指定 `deep: true`。

* **选项：immediate**

  在选项参数中指定 `immediate: true` 将立即以表达式的当前值触发 `cb` 回调。

* **选项：onError**

  `fn()` 或 `cb()` 执行报错时触发。

## getPlugins()

* **返回值：**`{IModule[]} plugins`
* **用法：**

  该方法是一个生命周期方法，在 `AppStore` 初始化时被调用，获取 AppStore 上需要挂载插件类。

  在基类中，已经内置了一系列插件类，子类可以根据需要，去掉预置的插件类，替换成自定义的插件类。

* **示例：**

  ```ts
  import { AppStore, JSBridge } from '@alipay/goldfish';

  class BizJSBridge extends JSBridge {

  }

  export default class BizAppStore extends AppStore {
    public getPlugins() {
      const plugins = super.getPlugins();
      for (const i in plugins) {
        if (plugins[i] === JSBridge) {
          plugins[i] = BizJSBridge;
          break;
        }
      }
      return plugins;
    }
  }
  ```

## destroy()

生命周期方法，销毁 `AppStore` 实例，释放资源。

## requestH5Data(path, basementProjectName)

* **参数：**

  * `{string} path` 凤蝶区块数据在项目中的 Schema 文件路径
  * `{string} basementProjectName` 凤蝶区块数据在 Basement 上的项目名

* **返回值：**`{Promise<any>}`

* **用法：**

  请求凤蝶区块数据，更多内容查看 [Requester 数据请求插件](./plugins.html#requester-%E6%95%B0%E6%8D%AE%E8%AF%B7%E6%B1%82%E6%8F%92%E4%BB%B6)。

* **示例：**

  ```ts
  import { AppStore } from '@alipay/goldfish';

  export default class BizAppStore extends AppStore {
    public async fetchInitData() {
      await super.fetchInitData();

      interface IConfig {
        name: string;
      }
      const data: IConfig = await this.requestH5Data<IConfig>('config-h5data', 'pmp');
      // Do something with `data`.
    }
  }
  ```

## requestOverseatwa(api, params?, options?)

请求 overseatwa 应用接口，详细内容查看 [Requester 数据请求插件](./plugins.html#requester-%E6%95%B0%E6%8D%AE%E8%AF%B7%E6%B1%82%E6%8F%92%E4%BB%B6)。

## requestTWA(api, params?, options?)

请求 TWA 应用接口，详细内容查看 [Requester 数据请求插件](./plugins.html#requester-%E6%95%B0%E6%8D%AE%E8%AF%B7%E6%B1%82%E6%8F%92%E4%BB%B6)。

## setBridgeMockLocation(mockLocation)

设置 JSBridge 插件模块中的模拟位置信息。
