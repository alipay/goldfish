---
sidebarDepth: 3
---

# Plugins

In Goldfish, we build a simple plugin system to manage such function modules:

* Container environment related modules, like [JSAPIs](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314206).
* Very independent modules, like data requester.

There are 5 built-in plugins:

* `ConfigPlugin`: Manage the App configurations.
* `RoutePlugin`: App route management.
* `FeedbackPlugin`: Pop up global toasts, alerts, prompts and confirms.
* `BridgePlugin`: Provide a wrapper for JSAPIs, and mainly for JSAPIs mocking.
* `RequesterPlugin`: Manage the data requests and provide the loading state.

You can override the build-in plugins by overriding them:

```ts
import { RequesterPlugin, AppStore, getPlugin } from '@goldfishjs/core';

class MyRequesterPlugin extends RequesterPlugin {
  public init(getPlugin: GetPlugin) {}
}

class MyAppStore extends AppStore {
  public getPlugins() {
    // Override the built-in RequesterPlugin
    return [...super.getPlugins(), MyRequesterPlugin];
  }
}
```

::: warning
Do not override the `ConfigPlugin`.
:::

You can also make your own plugins:

```ts
import { Plugin, AppStore, GetPlugin } from '@goldfishjs/core';

class MyPlugin extends Plugin {
  // Do not forget to give a name to your plugin.
  public static type = 'myplugin';

  public init(getPlugin: GetPlugin) {}
}

class MyAppStore extends AppStore {
  public getPlugins() {
    // Add your new plugin.
    return [...super.getPlugins(), MyPlugin];
  }
}
```

You can access the plugin by [`AppStore#getPluginInstance()`](./api/#getplugininstance):

```ts
import { PageStore } from '@goldfishjs/core';
import MyAppStore from '../../MyAppStore';

class MyPageStore extends PageStore<MyAppStore> {
  public foo() {
    const myPluginInstance = this.globalStore.getPluginInstance(MyPlugin);
  }
}
```
