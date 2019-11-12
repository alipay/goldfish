# 核心概念

在使用 Goldfish 编码时，有三个核心概念：**setup 函数**、**use 函数**、**插件**。

## setup 函数

**setup 函数**提供 **use 函数**的同步执行环境，同时返回小程序 App、Page、Component 的配置对象。

有三个 **setup 函数**：

* **setupApp** 构造[小程序 App 配置对象](https://docs.alipay.com/mini/framework/app-detail)
* **setupPage** 构造[小程序 Page 配置对象](https://docs.alipay.com/mini/framework/page-detail)
* **setupComponent** 构造[小程序 Component 配置对象](https://docs.alipay.com/mini/framework/component_object)

`setupApp()` 的返回值会被转换为小程序全局数据。`setupPage()` 和 `setupComponent()` 可以同时返回数据属性和方法属性，数据属性可以直接在对应模板中访问到，方法属性在模板中可作为事件回调方法使用。

## use 函数

**use 函数**只能同步地在 **setup 函数**中执行，分为两大类：**基础 use 函数**和**扩展 use 函数**。

**基础 use 函数**是最底层、最原始的 **use 函数**，比如 `useState()`、`useComputed()`、`usePageLifeCycle()` 等都是属于**基础 use 函数**。

**扩展 use 函数**是在**基础 use 函数**之上扩展出来的 **use 函数**，比如 `useDevice()` 等。

**use 函数**就像一个个小的功能模块，它们在 **setup 函数**中通过相互组合实现最终的业务功能。

有的 **use 函数**会对 **setup 函数**环境有要求，比如 `usePageLifeCycle()` 不能在 `setupApp()` 中使用，如果不小心使用了，Goldfish 会直接抛出异常。

## 插件

Goldfish 的插件主要是“非常独立的功能模块”或者“容器兼容相关的模块”或者“接入第三方平台”，比如 JSBridge、数据请求、业务埋点等等。

Goldfish 已经内置了六个插件：

* [JSBridge 插件](../api/plugins.html#jsbridge-插件)；
* [交互反馈插件](../api/plugins.html#feedback-交互反馈插件)；
* [日志插件](../api/plugins.html#log-日志插件)；
* [数据请求插件](../api/plugins.html#requester-数据请求插件)；
* [应用内路由插件](../api/plugins.html#route-应用内路由插件)；
* [业务埋点插件](../api/plugins.html#trace-业务埋点插件)。

当然，也可以扩展自己需要的插件。自定义插件必须要继承自内置插件或者[插件基类 Plugin](../api/plugins.html#插件基类-plugin)，然后传入 `setupApp()`：

```ts
App(setupApp(
  config,
  () => {
    return {};
  },
  {
    plugins: [MyCustomPlugin],
  },
));
```
