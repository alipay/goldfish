# Go Deeper into the Reactivity System

In Goldfish, the status data are managed in the Vue alike responsive manner.

## What is the Reactivity System

Let's take the simplest example. Suppose there are two variables `a` and `b`, and the third variable is derived from `a` and `b`. The relation between them is as below:

```js
c = a + b
```

In traditional imperative programming, whenever `a` or `b` changes, the operation assignment is called manually to maintain the above equation. In the development of front end, the factors that trigger `a` or `b` change include user operation, timer, data request success, etc., which are diversified and subject to loss of operation assignment, resulting in bugs.

So, the first thing for the reactivity system is to automatically update `c` when `a` or `b` changes, so as to maintain the freshness of `c` value.

Thanks to the reactivity system, we just need to declare the logic relation between `c` and `a` & `b` and do not worry about the data synchronization, so the burden on the developers is minimized.

## Reactivity in Goldfish

In fact there are many JavaScript libraries in the community which have been reactivity enabled, such as Vue and MobX.

Goldfish is built with its own implementation, which is basically consistent with Vue in terms of principle and experience.

In principle, Goldfish implements the reactivity by intercepting getters and setters.

To convert normal data into a reactive one, use `useState()` function:

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
  fullName: string;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
    get fullName() {
      return `${this.name}.alilang`;
    },
  });

  return {};
}));
```

The common JavaScript object becomes a reactive JavaScript object after being processed by the `useState()`. The `useState()` traverses the passed in objects recursively and converts all enumerable attributes into corresponding getters and setters, and gets ready for the interception logics. When the `data.name = 'Blue hole’` is executed, it triggers the prepared setter, so Goldfish senses the change and marks the `data.name` with `changed`. When the `data.name` data is visited, it triggers the prepared getter, then Goldfish knows it's value is visited, and the new value of `data.name` is returned.

`data.fullName` is the data derived from `data.name`. When the `data.name` changes, the `computed.fullName` changes too. So the `data.name` can also be said as the dependence of the `computed.fullName`.

When the reactive data changes, you can use the `autorun()` to execute some operations:

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

When the `data.name` changes, the callback function that is passed to the `autorun()` will be executed. The `data.name` is called the dependent data of the `autorun()`.

You can also use `watch()` to listen to the change of the reactive data, and execute some operations upon the change:

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

Here we passed two function parameters to the `watch()`. When the reactive result of the first callback function changes, the second callback function will be executed. The `data.name` that affects the reactive result of the first callback function is called the dependent data of the `watch()`.

The above are the basic contents of the reactivity in Goldfish.

Now you may have a question: why the derived data (like `data.fullName`), `autorun()` and `watch()` can sense the change of the dependent data?

Actually when the getter of the derived data, `autorun()` callback function and the first callback function of `watch()` is executed, it accesses the getter of a series of reactive data in the function body, so Goldfish knows the dependencies. When such dependencies change, the corresponding logic is triggered.

Suppose there are some codes as below:

```ts
import { useState, setupPage } from '@alipay/goldfish';

interface IState {
  name: string;
  age: number;
  year: number;
  fullName: string;
}

Page(setupPage(() => {
  const data = useState<IState>({
    name: 'Yu Jiang',
    age: 29,
    year: 5,
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

When first getting the value of the derived `data.fullName`, the getter function is executed. Then the `data.age` is accessed, so `data.age` become a dependency of `data.fullName`. And then, the `data.name` is accessed, so `data.name` also become a dependency of `data.fullName`. Now the first value calculation of `data.fullName` and dependency recoding are completed.

When the `data.age` turns into 31, Goldfish internally marks `data.fullName` as dirty. In the next accessing to `data.fullName`, the getter function of `data.fullName` is executed, and the discovered dependencies are `data.age`, `data.name` and `data.year` in turn.

The dependence recording of `autorun()` and `watch()` is similar to the derived data.

## Attentions

When passing the reactive data, the reactive link may be broken frequently if you are not familiar with the reactivity principles.

Suppose there are codes as below:

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

We assign the `data.name` to the `name` property of the returned object. Actually, we just assign the snapshot value of `data.name` to the `name` property while initializing the returned object. When we change the value of `data.name`, the value of `name` property in returned object will not be updated.

Luckily, there is a workaround:

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
    get name() {
      return data.name;
    },
  };
}));
```
