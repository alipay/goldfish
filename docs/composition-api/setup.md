---
sidebarDepth: 3
---

# Setup Functions

The setup functions are used to provide execution environment for the function-based APIs.

There are three setup functions for mini program: `setupApp`, `setupPage`, `setupComponent`.

## `setupApp()`

* **Arguments:**
  * `{object} config` The configuration for whole app.
  * `{Function} fn` Provide an environment for function-based APIs.
  * `{object?} setupOptions`
    * `{PluginClass[]?} plugins` An array of plugins should be registered.
* **Returns:** The configurations that used to pass into [App](https://opendocs.alipay.com/mini/framework/app-detail).
* **Description:**

  `setupApp()` is used to generate App configurations.

  ```ts
  import { setupApp } from '@goldfishjs/composition-api';
  import { IConfig } from '@goldfishjs/plugins';

  const config: IConfig = {
  };

  App(setupApp(
    config,
    () => {
      return {
        globalName: '1111',
      };
    }),
  );
  ```

## `setupPage()`

* **Arguments:**
  * `{Function} fn` Provide an environment for function-based APIs.
* **Returns:** The configurations that used to pass into [Page](https://opendocs.alipay.com/mini/framework/page-detail).

## `setupComponent()`

* **Arguments:**
  * `{object} defaultProps`
  * `{Function} fn` Provide an environment for function-based APIs.
* **Returns:** The configurations that used to pass into [Component](https://opendocs.alipay.com/mini/framework/component_object).
