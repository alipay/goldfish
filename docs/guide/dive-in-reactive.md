# 深入响应式细节

在 Goldfish 中，状态数据是基于类似 Vue 的响应式方式进行管理的。

## 什么是响应式

举个最简单的例子，假设有两个变量 a、b，第三个变量 c 是由 a、b 派生出来的，存在如下关系：

```js
c = a + b
```

在传统的命令式编程中，当 a 或者 b 发生变化时，为了维护上述等式关系，必须手动调用一次运算赋值操作。在前端开发中，触发 a 或者 b 变化的因素可能是用户的操作、定时器触发、数据请求成功等等，非常分散，很容易忘记调用运算赋值操作，造成 bug。

那么响应式要做的首要事情，就是在 a 或 b 发生变化之后，自动更新 c，从而保证 c 的值一直是“新鲜”的。

有了响应式能力，我们就只需要声明 c 与 a、b 之间的逻辑关系，并不需要操心什么时候应当同步，极大降低了开发者的心智负担。

## Goldfish 中的响应式

实际上，社区中已经有很多 JavaScript 库实现了响应式，比如 Vue、MobX 等等。

Goldfish 也内置了自己的实现，在原理上和使用体感上与 Vue 基本保持一致。

原理上，Goldfish 是通过拦截 getter、setter 来实现响应式的。

将普通数据转换为响应式数据，可以使用 `useState()`：

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
  });

  return {};
}));
```

普通 Javascript 经过 `useState()` 加工之后，就变成了响应式对象。Goldfish 会深度遍历目标对象，将所有可枚举属性都转换成相应的 getter、setter，并准备好拦截逻辑。当执行 `data.name = '蓝洞'` 的时候，会触发事先准备好的 setter，从而 Goldfish 感知到改动，并将 `data.name` 做一个“已改动”标记；当获取 `data.name` 数据时，会触发实现准备好的 getter，Goldfish 感知到当前正在获取值，拿到 `data.name` 的新值之后返回。

你也可以使用 `useComputed()` 来生成“派生数据”：

```ts
import { useState, setupPage, useComputed } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
  });

  const computed = useComputed({
    get fullName() {
      return `${data.name}.蚂蚁`;
    },
  });

  return {};
}));
```

`computed.fullName` 即为从 `data.name` 派生出来的数据。当 `data.name` 发生变化时，获取到的 `computed.fullName` 也会发生变化，因此 `data.name` 也可以说是 `computed.fullName` 的依赖数据。

在数据发生变化时，你可以借助 `autorun()` 执行一些操作：

```ts
import { useState, setupPage, useAutorun } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
  });

  const autorun = useAutorun();
  autorun(() => {
    console.log(data.name);
  });

  return {};
}));
```

当 `data.name` 发生变化时，传给 `autorun()` 的回调函数都会被执行一次。`data.name` 称为 `autorun()` 的依赖数据。

你也可以使用 `watch()` 来监听响应式数据计算结果的变化，在其变化的时候执行某些操作：

```ts
import { useState, setupPage, useWatch } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
  });

  const watch = useWatch();
  watch(
    () => data.name,
    (newVal) => {
      console.log(newVal);
    },
  );

  return {};
}));
```

当第一个回调函数的结果发生变化时，传给 `watch()` 的第二个回调函数都会被执行一次。其中，影响第一个回调函数结果的 `data.name` 称为 `watch()` 的依赖数据。

上述即为 Goldfish 响应式能力的基本内容。

看完上述内容，可能会有疑问：为什么 `computed`、`autorun()`、`watch()` 能感知到依赖数据的变化？

实际上，在 `computed` 的 getter、`autorun()` 的回调函数、`watch()` 的第一个回调函数执行的时候，会访问到函数体内一系列响应式数据的 getter，从而 Goldfish 能知道依赖哪些数据，当这些数据发生变化后，便会触发相应的内容。

假设有如下代码：

```ts
import { useState, setupPage, useComputed } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
  year: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
    year: 5,
  });

  const computed = useComputed({
    get fullName() {
      if (data.age > 30) {
        return `${data.name}.${data.year}年老蚂蚁`;
      }

      return `${data.name}.小蚂蚁`;
    },
  });

  return {};
}));
```

在第一次访问 `computed.fullName` 的时候，会执行 getter 函数，首先访问了 `data.age`，所以 `data.age` 是 `computed.fullName` 的一个依赖数据，接着又访问了 `data.name`，所以 `data.name` 也成为了 `computed.fullName` 的依赖项，至此第一次求值和依赖搜集结束。

当 `data.age` 变为 31 以后，Goldfish 内部会将 `computed.fullName` 标记为 dirty，再次访问 `computed.fullName` 时，执行 `computed.fullName` 的 getter 函数，搜集到的依赖数据依次为 `data.age`、`data.name`、`data.year`。

`autorun()` 和 `watch()` 搜集依赖的原理与 `computed` 类似。

## 注意事项

在传递响应式数据的时候，如果对响应式原理不熟练，就会经常遇到响应式链断裂的问题。

设想有如下代码：

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
  });

  return {
    name: data.name,
  };
}));
```

在返回模板数据的时候，直接将 `data.name` 赋值给返回对象的 `name` 属性，其实这个时候只是将 `data.name` 的快照值给到了返回对象的 `name` 属性，后续对 `data.name` 的变更就无法反应到模板上去了。

此处有两种写法可以绕开这个问题：

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: '禺疆',
    age: 29,
  });

  return {
    // 在模板中使用 data.name 访问
    data,
    // 在模板中使用 name 访问
    get name() {
      return data.name;
    },
  };
}));
```
