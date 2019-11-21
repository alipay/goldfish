---
sidebarDepth: 3
---

# State Management

In Goldfish, we can use *Store Classes* to manage states.

## AppStore

`AppStore` is the base class for managing the states of [App](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314095).

You can create a class to extend the base `AppStore`:

```ts
import { AppStore } from '@goldfishjs/core';

export default class MyAppStore extends AppStore {
  // Put your codes here.
}
```

In the base class `AppStore`, there are some useful members.

### `pluginHub`

* **Protected**
* **Type:** `PluginHub`
* **Description:**

  The `pluginHub` is used to manage all plugins. About the plugin system, you can refer it [here](./plugins.html).

### `isInitLoading`

* **Public**
* **Type:** `boolean`
* **Description:**

  Refer to [`fetchInitData()`](#fetchinitdata).

### `init()`

* **Public**
* **Lifecycle**
* **Description:**

  Called while the App is being initialized. More detailed, it is called in [the onLaunch lifecycle](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314095#36ba73e5) of the App.

  You can override this method to add your own logic:

  ```ts {4-8}
  import { AppStore } from '@goldfishjs/core';

  export default class MyAppStore extends AppStore {
    public init() {
      super.init();

      // Add your codes here.
    }
  }
  ```

### `fetchInitData()`

* **Public**
* **Lifecycle**
* **Returns:** A promise object to infer that all asynchronous tasks are finished.
* **description:**

  `fetchInitData()` is used to execute asynchronous tasks like requesting data from server while initializing. This method is called in `init()`. During the method being executed, the `isInitLoading` is `true`, otherwise it is `false`.

  ```ts {17-25}
  import {
    AppStore,
    observable,
    state,
    RequesterPlugin,
  } from '@goldfishjs/core';

  export interface IStudent {
    name: string;
    age: number;
  }

  @observable
  export default class MyAppStore extends AppStore {
    public studentList: IStudent[] = [];

    async public fetchInitData() {
      await super.fetchInitData();

      const requesterPlugin = this.pluginHub.getPluginInstance(Requester);
      this.studentList = await requesterPlugin.request<IStudent[]>(
        'http://www.xxx.com',
        {},
      );
    }
  }
  ```

### `getPlugins()`

* **Public**
* **Returns:** A list of plugin classes.
* **Description:**

  It is used to configure all the plugins that will be used in current App. The base `getPlugins()` method returns the inner plugin classes, and you should not remove this members in the derived `getPlugins()` method. But you can add new plugins:

  ```ts {18-23}
  import {
    AppStore,
    Plugin,
    GetPlugin,
  } from '@goldfishjs/core';

  class MyPlugin extends Plugin {
    public static type = 'myplugin';

    public init(getPlugin: GetPlugin) {
      // `getPlugin` can be used to access other registered plugins.
    }

    public destroy() {}
  }

  export default class MyAppStore extends AppStore {
    public getPlugins() {
      return [
        ...super.getPlugins(),
        MyPlugin,
      ];
    }
  }
  ```

### `getPluginInstance()`

* **Public**
* **Arguments:**
  * `{PluginClass | string} pluginClass`
* **Returns:** The plugin instance of the `pluginClass`.
* **Description:**

  Get the specified plugin instance from the registered plugins.

  ```ts {29-33}
  import {
    AppStore,
    Plugin,
    GetPlugin,
  } from '@goldfishjs/core';

  class MyPlugin extends Plugin {
    public static type = 'myplugin';

    public init(getPlugin: GetPlugin) {
      // `getPlugin` can be used to access other registered plugins.
    }

    public destroy() {}

    public bar() {
      console.log('bar');
    }
  }

  export default class MyAppStore extends AppStore {
    public getPlugins() {
      return [
        ...super.getPlugins(),
        MyPlugin,
      ];
    }

    public foo() {
      const myPlugin = this.getPluginInstance(MyPlugin);
      // Output: bar.
      myPlugin.bar();
    }
  }
  ```

### `waitForPluginsReady()`

* **Public**
* **Returns:** A promise object to ensure that all plugins have been initialized.
* **Description:**

  Wait for all the plugins returned by `getPlugins()` being initialized.

  ```ts {4-7}
  import { AppStore } from '@goldfishjs/core';

  export default class MyAppStore extends AppStore {
    async public foo() {
      await this.waitForPluginsReady();
      console.log('All plugins have been initialized, and you can use them now.');
    }
  }
  ```

### `waitForInitDataReady()`

* **Public**
* **Returns:** A promise object to ensure that all asynchronous tasks have been finished.
* **Description:**

  Wait for [`fetchInitData()`](./#fetchinitdata) being finished.

  ```ts {4-8}
  import { AppStore } from '@goldfishjs/core';

  export default class MyAppStore extends AppStore {
    async public foo() {
      await this.waitForIniDataReady();
      // Output: false.
      console.log(this.isInitLoading);
    }
  }
  ```

### `waitForReady()`

* **Public**
* **Returns:** A promise object to ensure all plugins initializations and asynchronous tasks have completed.
* **Usage:**

  ```ts {4-7}
  import { AppStore } from '@goldfishjs/core';

  export default class MyAppStore extends AppStore {
    async public foo() {
      await this.waitForReady();
      // You can use plugins now and the init data is prepared.
    }
  }

### `autorun()`

* **Public**
* **Arguments:**
  * `{AutorunFunction} fn`
  * `{IErrorCallback?} errorCb` Called when there is some wrong with `fn()`.
* **Returns:** A function to stop listening to the dependency data changes.
* **Description:**

  Auto executing the `fn()` when the reactive data in the `fn()` is changed.

  ```ts {8-23}
  import { AppStore, observable, state } from '@goldfishjs/core';

  @observable
  export default class MyAppStore extends AppStore {
    @state
    public name: string = 'Yu Jiang';

    public foo() {
      this.autorun(() => {
        console.log(this.name);
      });

      setTimeout(
        () => {
          this.name = 'Dian Dao';
        },
        1000,
      );

      // Output:
      // Yu Jiang
      // Dian Dao
    }
  }
  ```

### `watch()`

* **Public**
* **Arguments:**
  * `{IWatchExpressionFn} fn`
  * `{IWatchCallback} cb`
  * `{IWatchOptions?} options`
    * `{boolean?} deep` Whether detect nested value changes inside reactive objects. Default is `false`.
    * `{boolean?} immediate` Whether to execute `cb()` immediately with the initial return value of `fn()`.
    * `{IErrorCallback?} onError` Called when there is some thing wrong with `fn()` or `cb()`.
* **Returns:** A function to stop listening to the dependency data in `fn()`.
* **Description:**

  Call the `cb()` when the reactive data in the `fn()` is changed.

  ```ts {8-25}
  import { AppStore, observable, state } from '@goldfishjs/core';

  @observable
  export default class MyAppStore extends AppStore {
    @state
    public name: string = 'Yu Jiang';

    public foo() {
      this.watch(
        () => this.name,
        () => {
          console.log('Enter,', this.name);
        },
      );

      setTimeout(
        () => {
          this.name = 'Dian Dao';
        },
        1000,
      );

      // Output:
      // Enter, Dian Dao
    }
  }
  ```

## PageStore

`PageStore` is the base class for managing the states of [Page](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314093).

You can create a class to extend the base `PageStore`:

```ts
import { PageStore } from '@goldfishjs/core';

export default class MyPageStore extends PageStore {
  // Put your codes here.
}
```

In the base class `PageStore`, there are some useful members.

### `globalStore`

* **Public**
* **Type:** `AppStore`
* **Description:**

  Reference to the global `AppStore` instance.

  You can specify the type of global store when create the subclass of `PageStore`:

  ```ts
  import { PageStore } from '@goldfishjs/core';
  import MyAppStore from '../../MyAppStore';

  export default class MyPageStore extends PageStore<MyAppStore> {
  }
  ```

  Now, you can visit the extended members in `MyAppStore` with `this.globalStore.myExtendedMember`, and the TypeScript compiler does not complain.

### `init()`

* **Public**
* **Lifecycle**
* **Description**

  It is similar with [`AppStore#init()`](./#init), but in the [Page](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314093) lifecycle.

### `destroy()`

* **Public**
* **Lifecycle**
* **Description:**

  Called when the Page is destroyed.

  ```ts {4-7}
  import { PageStore } from '@goldfishjs/core';

  export default class MyPageStore extends PageStore {
    public destroy() {
      super.destroy();
      // Put your destroy logic here.
    }
  }
  ```

### `fetchInitData()`

* **Public**
* **Lifecycle**
* **Returns:** `Promise<void>`

  It is similar with [`AppStore#fetchInitData()`](./#fetchinitdata), but in the [Page](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314093) lifecycle.

### `autorun()`

* **Public**
* **Arguments:**
  * `{AutorunFunction} fn`
  * `{IErrorCallback?} errorCb`
* **Returns:** `Function`
* **Description:**

  It is similar with [`AppStore#autorun()`](./#autorun). If you do not stop the listening manually, it will be stopped when [Page](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314093) is destroyed.

### `watch()`

* **Public**
* **Arguments:**
  * `{IWatchExpressionFn} fn`
  * `{IWatchCallback} cb`
  * `{IWatchOptions?} options`
    * `{boolean?} deep`
    * `{boolean?} immediate`
    * `{IErrorCallback?} onError`
* **Returns:** Function
* **Description:**

  It is similar with [`AppStore#init()`](./#init). If you do not stop the listening manually, it will be stopped when [Page](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000314093) is destroyed.

## ComponentStore

`ComponentStore` is the base class for managing the states of [Component](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000310008).

You can create a class to extend the base `ComponentStore`:

```ts
import { ComponentStore } from '@goldfishjs/core';

export default class MyComponentStore extends ComponentStore<{}> {
  // Put your codes here.
}
```

In the base class `ComponentStore`, there are some useful members.

### `props`

* **Public**
* **Type:** `object`
* **Description:**

  You should declare all component props here:

  ```ts {14-17}
  import { ComponentStore, observable } from '@goldfishjs/core';
  import MyAppStore from '../../MyAppStore';

  export interface IProps {
    name?: string;
    age?: number;
  }

  @observable
  export default class MyComponentStore
    extends ComponentStore<IProps, MyAppStore>
  {
    @state
    public props = {
      name: undefined,
      age: undefined,
    };
  }
  ```

### `globalStore`

* **Public**
* **Type:** `AppStore`
* **Description:**

  Reference to the global `AppStore` instance.

  You can specify the type of global store when create the subclass of `ComponentStore`:

  ```ts
  import { PageStore } from '@goldfishjs/core';
  import MyAppStore from '../../MyAppStore';

  export default class MyPageStore extends PageStore<{}, MyAppStore> {
  }
  ```

  Now, you can visit the extended members in `MyAppStore` with `this.globalStore.myExtendedMember`, and the TypeScript compiler does not complain.

### `init()`

* **Public**
* **Lifecycle**
* **Description**

  It is similar with [`AppStore#init()`](./#init), but in the [Component](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000310008) lifecycle.

### `destroy()`

* **Public**
* **Lifecycle**
* **Description:**

  Called when the [Component](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000310008) is destroyed.

  ```ts {4-7}
  import { PageStore } from '@goldfishjs/core';

  export default class MyPageStore extends PageStore {
    public destroy() {
      super.destroy();
      // Put your destroy logic here.
    }
  }
  ```

### `fetchInitData()`

* **Public**
* **Lifecycle**
* **Returns:** `Promise<void>`

  It is similar with [`AppStore#fetchInitData()`](./#fetchinitdata), but in the [Component](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000310008) lifecycle.

### `autorun()`

* **Public**
* **Arguments:**
  * `{AutorunFunction} fn`
  * `{IErrorCallback?} errorCb`
* **Returns:** `Function`
* **Description:**

  It is similar with [`AppStore#autorun()`](./#autorun). If you do not stop the listening manually, it will be stopped when [Component](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000310008) is destroyed.

### `watch()`

* **Public**
* **Arguments:**
  * `{IWatchExpressionFn} fn`
  * `{IWatchCallback} cb`
  * `{IWatchOptions?} options`
    * `{boolean?} deep`
    * `{boolean?} immediate`
    * `{IErrorCallback?} onError`
* **Returns:** Function
* **Description:**

  It is similar with [`AppStore#init()`](./#init). If you do not stop the listening manually, it will be stopped when [Component](https://open-ewallet.dl.alipaydev.com/document/ninbavtm/0000000000310008) is destroyed.
