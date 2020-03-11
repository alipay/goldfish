---
sidebarDepth: 3
---

# Basic Functions

There are some basic functions (Composition APIs). Base on these functions, you can write more powerful functions (Composition APIs).

## Lifecycle

### `useAppLifeCycle()`

* **Arguments:**
  * `{string} name` The [lifecycle](https://opendocs.alipay.com/mini/framework/app-detail#object%20%E5%B1%9E%E6%80%A7%E8%AF%B4%E6%98%8E) name.
  * `{Function} fn`
* **Description:**

  Add function to the specified lifecycle.

  ```ts
  import { setupApp, useAppLifeCycle } from '@goldfishjs/composition-api';
  import { IConfig } from '@goldfishjs/plugins';

  const config: IConfig = {};

  App(setupApp(config, () => {
    useAppLifeCycle('onShow', () => {
      // Put your codes here.
    });
    return {};
  }));
  ```

### `usePageLifeCycle()`

* **Arguments:**
  * `{string} name` The [lifecycle](https://opendocs.alipay.com/mini/framework/page-detail#%E9%A1%B5%E9%9D%A2%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F) name.
  * `{Function} fn`
* **Description:**

  Add function to the specified lifecycle.

  ```ts
  import { setupPage, usePageLifeCycle } from '@goldfishjs/composition-api';

  Page(setupPage(() => {
    usePageLifeCycle('onShow', () => {
      // Put your codes here.
    });
    return {};
  }));
  ```

### `useComponentLifeCycle()`

* **Arguments:**
  * `{string} name` The [lifecycle](https://opendocs.alipay.com/mini/framework/component-lifecycle) name.
  * `{Function} fn`
* **Description:**

  Add function to the specified lifecycle.

  ```ts
  import { setupComponent, useComponentLifeCycle } from '@goldfishjs/composition-api';

  Component(setupComponent(() => {
    useComponentLifeCycle('didMount', () => {
      // Put your codes here.
    });
    return {};
  }));
  ```

### `useFetchInitData()`

* **Arguments:**
  * `{Function} fn` Fetch the initial data.
  * `{boolean} isAsync` Whether to execute asynchronously with the previous functions.
* **Description:**

  Add the data fetching function. You can add several data fetching functions in one page, app, or component.

  ```ts
  import { setupPage, useFetchInitData } from '@goldfishjs/composition-api';

  Page(setupPage(() => {
    useFetchInitData(function fn1() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    useFetchInitData(function fn2() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });
    return {};
  }));
  ```

### `usePageEvents()`

* **Arguments:**
  * `{string} name` The event name.
  * `{Function} fn` The event callback.
* **Description:**

  Add the callback for the specified event in page. You can find out all supported events [here](https://opendocs.alipay.com/mini/framework/page-detail).

  ```ts
  import { setupPage, usePageEvents } from '@goldfishjs/composition-api';

  Page(setupPage(() => {
    usePageEvents('onBack', () => {
      // Put your codes here.
    });

    return {};
  }));
  ```

## Data

### `useState()`

* **Arguments:**
  * `{Record<string, any>} obj`
* **Returns:** An reactive object.
* **Description:**

  `useState()` is used to convert a normal object to an reactive one.

  ```ts
  import { useState, setupPage } from '@goldfishjs/useState';

  interface IState {
    name: string;
    fullName: string;
  }

  Page(setupPage(() => {
    const state = useState<IState>({
      name: 'yibuyisheng',
      get fullName() {
        return `${this.name}.front-end`;
      },
    });

    return {
      state,
    };
  }));
  ```

### `useProps()`

* **Returns:** An reactive object of component props.
* **Description:**

  `useProps()` can convert props to an reactive object. You should declare all props with the default value in `setupComponent`.

  ```ts
  import { setupComponent, useProps } from '@goldfishjs/component-api';

  export interface IProps {
    name: string;
  }

  Component(setupComponent<IProps>(
    {
      name: '',
    },
    () => {
      // `name` in props will be reactive.
      const props = useProps<IProps>();
      return {};
    },
  ));
  ```

### `useGlobalData()`

* **Returns:** The global data.
* **Description:**

  Get the global data. You should declare the global data in the App scope, and use it in other places.

  ```ts
  // file path: ./app.ts
  import { setupApp, useState } from '@goldfishjs/composition-api';
  import { IConfig } from '@goldfishjs/plugins';

  const config: IConfig = {};

  export interface IGlobalData {
    name: string;
    fullName: string;
  }

  App(setupApp(
    config,
    () => {
      const state = useState<IGlobalData>({
        name: '',
        get fullName() {
          return `${this.name}.heihei`;
        },
      });
      return state;
    }),
  );
  ```

  ```ts
  // file path: ./pages/index/index.ts
  import { setupPage, useGlobalData } from '@goldfishjs/composition-api';
  import { IGlobalData } from '../app';

  Page(setupPage(() => {
    const globalData = useGlobalData<IGlobalData>();

    // Get the `name` from global data.
    const name = globalData.get('name');

    // Set the value to `name`.
    globalData.set('name', 'zs');
    return {};
  }));
  ```

### `useAutorun()`

* **Returns:** `(fn, errorCb) => Function`.
  * **Arguments:**
    * `{AutorunFunction} fn`
    * `{IErrorCallback?} errorCb` Called when there is some wrong with `fn()`.
  * **Returns:** A function to stop listening to the dependency data changes.
* **Description:**

  Create an `autorun()` function.

  ```ts
  import { setupPage, useAutorun, useState } from '@goldfishjs/composition-api';

  interface IState {
    name: string;
  }

  Page(setupPage(() => {
    const state = useState<IState>({
      name: 'ls',
    });
    const autorun = useAutorun();

    // Firstly, it prints `ls`. After 1000ms, it prints `zs`.
    // In the every execution of the function parameter pass into the `autorun`, Goldfish will collect
    // the dependencies of the reactive data. When the dependent reactive data changes, the function will
    // be called.
    autorun(() => {
      console.log(state.name);
    });

    setTimeout(
      () => {
        state.name = 'zs';
      },
      1000,
    );

    return {};
  }));
  ```

### `useWatch()`

* **Returns:** `(fn, cb, options) => Function`.
  * **Arguments:**
    * `{IWatchExpressionFn} fn`
    * `{IWatchCallback} cb`
    * `{IWatchOptions?} options`
      * `{boolean?} deep` Whether detect nested value changes inside reactive objects. Default is `false`.
      * `{boolean?} immediate` Whether to execute `cb()` immediately with the initial return value of `fn()`.
      * `{IErrorCallback?} onError` Called when there is some thing wrong with `fn()` or `cb()`.
  * **Returns:** A function to stop listening to the dependency data in `fn()`.
* **Description:**

  Create a `watch()` function.

  ```ts
  import { setupPage, useWatch, useState } from '@goldfishjs/composition-api';

  interface IState {
    name: string;
  }

  Page(setupPage(() => {
    const state = useState<IState>({
      name: 'ls',
    });
    const watch = useWatch();

    watch(
      () => state.name,
      () => {
        console.log(state.name);
      },
      {
        immediate: true,
      },
    );

    setTimeout(
      () => {
        state.name = 'zs';
      },
      1000,
    );

    return {};
  }));
  ```

### `useInitDataReady()`

* **Returns:** `() => Promise<unknown>`
  * **Returns:** A promise object to infer that all asynchronous tasks are finished.
* **Description:**

  The function `fn` returned by `useInitDataReady()` is used to ensure all [data fetching functions](#usefetchinitdata) are completed.

## Plugins

### `usePlugins()`

* **Returns:** `Plugin[]` Return all plugins registered in App.
* **Description:**

  Get all plugins.

  ```ts
  import { setupPage, usePlugins } from '@goldfishjs/composition-api';

  Page(setupPage(() => {
    const plugins = usePlugins();

    plugins.feedback.addToast({
      content: 'toast!',
    });

    return {};
  }));
  ```

### `usePluginsReady()`

* **Returns:** `() => Promise`
* **Description:**

  The returned function can be used to ensure that all plugins have been initialized.

  ```ts
  import { setupPage, usePluginsReady, usePageLifeCycle } from '@goldfishjs/composition-api';

  Page(setupPage(() => {
    const ready = usePluginsReady();

    usePageLifeCycle('onShow', async () => {
      await ready();
      // Put your codes here.
    });

    return {};
  }));
  ```

## others

### `useContextType()`

* **Return:** The execution environment type: `app`, `page`, `component`.
* **Description:**

  * When the function based API is executed in `setupApp()`, `useContextType()` returns `app`.
  * When the function based API is executed in `setupPage()`, `useContextType()` returns `page`.
  * When the function based API is executed in `setupComponent()`, `useContextType()` returns `component`.

### `useReady()`

* **Returns:** `() => Promise`
* **Description:**

  The returned function can be used to ensure that all plugins have been initialized and all data fetching functions are completed.
