# 使用插件

在 Goldfish 中，构造了一套插件机制，主要期望对如下内容进行插件化：

1. 容器环境相关的 API；
2. 特定、独立的功能模块；
3. 产生副作用的。

Goldfish 内部也内置了一系列插件：

* JSBridge 插件；
* Feedback 交互反馈插件；
* Requester 数据请求插件；
* Route 应用内路由插件；
* Trace 业务埋点插件；
* Log 日志插件。

插件的使用，有两种方式：**集成式**和**独立式**。

## 集成式

在全面使用 Goldfish 的项目中（接入了应用入口、全局数据等模块），应当用该种方式使用插件。

构造 App 的时候，可以注册自定义插件：

```ts {11}
import { setupApp } from '@alipay/goldfish';
import { JSBridge } from '../plugins/JSBridge';

App(setupApp(
  {},
  () => {
    return {};
  },
  {
    // 注意：不传 plugins 参数时，所有内置插件会被自动注册；传入 plugins 参数时，只会注册 plugins 参数指定的插件。
    plugins: [JSBridge],
  },
));
```

在 `setupApp()` 和 `setupPage()` 中，可以通过 `usePlugins()` 获取所有内置插件：

```ts {6,11}
import { setupApp, usePlugins, useReady, useAppLifeCycle } from '@alipay/goldfish';

App(setupApp(
  {},
  () => {
    const plugins = usePlugins();
    const ready = useReady();

    useAppLifeCycle('onLaunch', async () => {
      await ready();
      plugins.bridge.pushWindow('https://www.alipay.com');
    });

    return {};
  },
));
```

::: warning
应当在 App 初始化完成之后，才使用插件。
:::

为了 TypeScript 能感知到自定义插件的类型，`usePlugins()` 也支持通过传入插件类的方式来获取指定插件：

```ts
import { setupApp, Plugin } from '@alipay/goldfish';

export class MyJSBridge extends Plugin {
  public static readonly type = 'customJSBridge';
}

App(setupApp(
  {},
  () => {
    // 通过 plugins.customJSBridge 拿到插件
    const plugins = usePlugins([MyJSBridge]);

    return {};
  },
));
```

## 独立式

在部分使用 Goldfish 的项目中，需要自己决定使用哪些插件：

```ts {7,9}
import { pluginHub, JSBridge } from '@alipay/goldfish';

(async () => {
  // 在适当的时候初始化：
  // await pluginHub.init();

  pluginHub.register(JSBridge);

  const bridge = await plugin.get(JSBridge);

  // 在适当的时候销毁：
  // pluginHub.destroy();
})();
```
