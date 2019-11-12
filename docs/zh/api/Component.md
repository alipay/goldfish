# 组件

在小程序中，除了页面组件，还有[普通组件](https://docs.alipay.com/mini/framework/custom-component-overview)。

在本框架中，我们在普通组件的基础上封装了 [Function based API](https://zhuanlan.zhihu.com/p/68477600)。

## setupComponent(props, fn, onError?)

* **参数：**
  * `{Object} props` 对应小程序组件的默认 props
  * `{Function} fn` setup 函数
  * `{Function} onError?` setup 函数执行出错时会触发

* **返回值：**`{ComponentOptions} options`

* **说明：**

  构造小程序组件的配置对象，同时提供获取组件相关 Function-based API 的执行环境 `fn`。

  如果第一个参数 `props` 是函数，那么会被作为 setup 函数，同时第二个参数（如果传了），会被作为 `onError()` 回调函数。

* **示例：**

  ```ts
  import { setupComponent } from '@alipay/goldfish';

  Component(setupComponent(
    () => {
      // 在该函数的同步流程中，可以执行 Function-based API。

      // 返回在模板中会使用到的数据和方法。
      return {};
    },
  ));
  ```

## useComponentLifeCycle(name, fn)

* **参数：**
  * `{string} name` 组件生命周期钩子的名字
  * `{Function} fn` 钩子函数

* **说明：**

  添加组件生命周期钩子函数。

  `fn()` 的参数会根据 `name` 来注入，比如 `name` 为 `didUpdate` 时，`fn()` 会收到 `prevProps` 和 `prevData` 参数。

* **示例：**

  ```ts
  import { useComponentLifeCycle, setupComponent } from '@alipay/goldfish';

  Component(setupComponent(
    () => {
      useComponentLifeCycle(
        'didMount',
        () => {
          console.log('didMount');
        },
      );

      return {};
    },
  ));
  ```

## useComponentStore()

* **返回值：**`{ComponentStore} componentStore`
* **说明：**

  获取当前组件的 store。

  组件 store 上有很多有用的方法，比如 `watch()`、`autorun()` 等等。

* **示例：**

  ```ts
  import { useComponentStore, setupPage } from '@alipay/goldfish';

  Component(setupComponent(
    () => {
      const store = useComponentStore();

      return {};
    },
  ));
  ```

## useComputed(obj)

参考页面的 `useComputed()`。

## useProps(isEqual?)

* **参数：**
  * `{Function} isEqual?`

* **返回值：**`{object} props`

* **说明：**

  将组件的 `props` 转换为响应式的。`isEqual()` 函数用于对比新旧 `props` 是否相等，如果不等，则会自动更新返回的 `props` 对象。

* **示例：**

  ```ts
  import { useProps, setupComponent, useComponentStore } from '@alipay/goldfish';

  Component(setupComponent(
    {
      name: 'diandao',
    },
    () => {
      const store = useComponentStore();
      const props = useProps<{ name: string }>();

      store.watch(
        () => props.name,
        () => {
          console.log('name prop changed.');
        },
      );

      return {};
    },
  ));
  ```

## useState(obj)

参考页面的 `useState()`。

## useValue(value)

参考页面的 `useValue()`。

## useView()

获取组件视图层实例，更多内容可参考页面的 `useView()`。
