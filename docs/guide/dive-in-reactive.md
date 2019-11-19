# Go Deeper Into Responsiveness

In Goldfish, the status data are managed in the Vue alike responsive manner.

## What is the responsiveness

Let's take the simplest example. Suppose there are two variables a and b, and the third variable is derivated from a and b. The relation is as below:

```js
c = a + b
```

In traditional imperative programming, whenever a or b changes, the operation assignment is called manually to maintain the above equation. In the development of front end, the factors that trigger a or b change include user operation, timer, data request success, etc., which are diversified and subject to loss of operation assignment, resulting in bug.

So, the first thing for the responsiveness is to automatically update c when a or b changes, so as to maintain the freshness of c value.

Thanks to the responsiveness, we just need to declare the logic relation between c and a & b and do not worry about timing for synchronization, so the burden on the developers is minimized.

## Responsiveness in Goldfish

In fact there are many JavaScript libraries in the community which have been responsiveness enabled, such as Vue and MobX.

Goldfish is built with its own implementation, which is basically consistent with Vue in terms of principle and experience.

In principle, Goldfish realizes responsiveness through intercepting getter and setter.

To convert normal data into a responsive one, use `useState()`:

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
  });

  return {};
}));
```

The common Javascript becomes a responsive object through the useState() processing.  Goldfish traverses deeply the target objects and converts all enumerable attributes into corresponding getter and setter, and gets ready for the interception logics. When the data.name = 'Blue hole’ is executed, it triggers the prepared setter, so Goldfish senses the change and marks the data.name with “changed”. When the data.name data is obtained, it triggers the prepared getter. The Goldfish senses it is obtaining value, gets the new value of data.name and then return it.

You can also use useComputed() to generate “derivated data”:

```ts
import { useState, setupPage, useComputed } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu jiang',
    age: 29,
  });

  const computed = useComputed({
    get fullName() {
      return `${data.name}.Ant`;
    },
  });

  return {};
}));
```

`computed.fullName` is the data derivated from `data.name`  When the `data.name` changes, the obtained `computed.fullName` changes too. So the `data.name` can also be said as the dependent data of the `computed.fullName`.

When the data changes, you can use the `autorun()` to execute some operations:

```ts
import { useState, setupPage, useAutorun } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
  });

  const autorun = useAutorun();
  autorun(() => {
    console.log(data.name);
  });

  return {};
}));
```

When the `data.name` changes, the callback function that is passed to the `autorun()` will be executed once. The `data.name` is called the dependent data of the `autorun()`.

You can also use `watch()` to listen to the change of responsive data computing results, and execute some operation upon the change:

```ts
import { useState, setupPage, useWatch } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
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

When the result of the first callback function changes, the second callback function that is passed to `watch()` will be executed once. Here, the `data.name` that affects the result of the first callback function is called the dependent data of the `watch()`.

The above are the basic contents of the Goldfish responsive ability.

Now you may have a question: why computed, `autorun()` and `watch()` can sense the change of dependent data?

Actually when the getter of `computed`, `autorun()` callback function and the first callback function of `watch()` is executed, it accesses the getter of a series of responsive data in the function body, so Goldfish knows which data are dependent. When such data changes, the corresponding contents are triggered.

Suppose there are code as below:

```ts
import { useState, setupPage, useComputed } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
  year: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
    year: 5,
  });

  const computed = useComputed({
    get fullName() {
      if (data.age > 30) {
        return `${data.name}.${data.year} Senior ant`;
      }

      return `${data.name}.Young ant`;
    },
  });

  return {};
}));
```

Upon the first access of `computed.fullName`, the getter function is executed. Firstly the `data.age` is accessed, so `data.age` is a dependent data of `computed.fullName`. Then, the `data.name` is accessed, so `data.name` is also a dependent item of `computed.fullName`. Now the first request and dependent search end.

When the `data.age` turns into 31, Goldfish internally marks `computed.fullName` as dirty. In the next access to `computed.fullName`, the getter function of `computed.fullName` is executed, and the discovered dependent data are `data.age`, `data.name` and `data.year` in turn.

The search dependence of `autorun()` and `watch()` has the principle similar to computed.

## Attentions

In passing the responsive data, the responsive link broken may be encountered frequently if you are not familiar with the responsiveness principles.

Suppose there are code as below:

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
  });

  return {
    name: data.name,
  };
}));
```

In returning template data, the `data.name` is directly assigned to the name attribute of the object. Actually just the snapshot value of the `data.name` is given to the name attribute of the return object. The subsequential change of the `data.name` will not be reflected on the template.

Two coding methods can be used to bypass the above problem:

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
  });

  return {
    // Use data.name access in the template
    data,
    // Use name access in the template
    get name() {
      return data.name;
    },
  };
}));
```
