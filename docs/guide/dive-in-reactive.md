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

In fact there are many JavaScript libraries in the community which have been reactivity enabled, such as [Vue](https://vuejs.org/v2/api/) and [MobX](https://mobx.js.org/README.html).

Goldfish is built with its own implementation, which is basically consistent with Vue in terms of principle and experience.

In principle, Goldfish implements the reactivity by intercepting getters and setters.

To convert normal data into a reactive one, use `state()` function:

```ts {4,7}
import { state, observable } from '@alipay/goldfish';

class MyClass {
  public name = state('Yu Jiang');
}

export default observable(MyClass);
```

Use `computed()` to create the derived data:

```ts {6,8-13,20}
import { state, computed } from '@alipay/goldfish';

class MyClass {
  public name = state('Yu Jiang');

  public fullName = computed(() => `${this.name}.alilang`);

  public nameAlias = computed({
    get: () => this.name,
    set: (v: string) => {
      this.name = v;
    },
  });

  public foo() {
    this.name = 'Blue hole';
  }
}

export default observable(MyClass);
```

The `fullName` is only readable, and the `nameAlias` is both readable and writable. The value of `fullName` and `nameAlias` is calculated from `name`;

The common JavaScript object becomes a reactive JavaScript object after being processed by the `state()` or `computed()`. The `state()` and `computed` mark the target to reactive data. `observable()` traverses the marked values recursively and converts all enumerable attributes into corresponding getters and setters, and gets ready for the interception logics. When `this.name = 'Blue hole'` is executed, it triggers the prepared setter, so Goldfish senses the change and marks the `this.name` with `changed`. When the `this.name` data is visited, it triggers the prepared getter, then Goldfish knows it's value is being visited, and the new value of `this.name` is returned.

`this.fullName` is the data derived from `this.name`. When `this.name` changes, `this.fullName` changes too. So `this.name` can also be said as the dependence of the `this.fullName`.

When the reactive data changes, you can use the `autorun()` to execute some operations:

```ts {6-21}
import { state, observable } from '@alipay/goldfish';

class MyClass {
  public name = state('Yu Jiang');

  public foo() {
    this.autorun(() => {
      console.log(this.name);
    });

    setTimeout(
      () => {
        this.name = 'Blue hole';
      },
      1000,
    );

    // Output:
    // Yu Jiang
    // Blue hole
  }
}

export default observable(MyClass);
```

When `this.name` changes, the callback function that is passed to the `autorun()` will be executed. `this.name` is called the *dependent data* of the `autorun()`.

You can also use `watch()` to listen to the change of the reactive data, and execute some operations upon the change:

```ts {6-23}
import { state, observable } from '@alipay/goldfish';

class MyClass {
  public name = state('Yu Jiang');

  public foo() {
    this.watch(
      () => this.name,
      (newVal) => {
        console.log(newVal);
      },
    );

    setTimeout(
      () => {
        this.name = 'Blue hole';
      },
      1000,
    );

    // Output:
    // Blue hole
  }
}

export default observable(MyClass);
```

Here we passed two function parameters to the `watch()`. When the reactive result of the first callback function changes, the second callback function will be executed. The `this.name` that affects the reactive result of the first callback function is called the dependent data of the `watch()`.

The above are the basic contents of the reactivity in Goldfish.

Now you may have a question: why the derived data (like `this.fullName`), `autorun()` and `watch()` can sense the change of the dependent data?

Actually when the getter of the derived data, `autorun()` callback function and the first callback function of `watch()` is executed, it accesses the getter of a series of reactive data in the function body, so Goldfish knows the dependencies. When such dependencies change, the corresponding logic is triggered.

Suppose there are some codes as below:

```ts
import { state, observable } from '@alipay/goldfish';

class MyClass {
  public name = state('Yu Jiang');

  public age = state(29);

  public year = state(5);

  public fullName = computed(() => {
    if (this.age > 30) {
      return `${this.name}.${this.year} Senior ant`;
    }

    return `${this.name}.Young ant`;
  });
}

export default observable(MyClass);
```

When first getting the value of the derived `this.fullName`, the getter function is executed. Then the `this.age` is accessed, so `this.age` become a dependency of `data.fullName`. And then, the `this.name` is accessed, so `this.name` also become a dependency of `this.fullName`. Now the first value calculation of `this.fullName` and dependency recoding are completed.

When the `this.age` turns into 31, Goldfish internally marks `this.fullName` as dirty. In the next accessing to `this.fullName`, the getter function of `this.fullName` is executed, and the discovered dependencies are `this.age`, `this.name` and `this.year` in turn.

The dependence recording of `autorun()` and `watch()` is similar to the derived data.

## Attentions

When passing the reactive data, the reactive link may be broken frequently if you are not familiar with the reactivity principles.

Suppose there are codes as below:

```ts
import { state, observable } from '@alipay/goldfish';

class MyClass {
  public name = state('Yu Jiang');

  public foo() {
    return {
      name: this.name;
    };
  }

  public bar() {
    this.watch(
      () => this.foo().name,
      () => {
        console.log('change');
      },
    );
  }
}
```

We assign the `this.name` to the `name` property of the returned object in `foo()`. Actually, we just assign the snapshot value of `this.name` to the `name` property while initializing the returned object. When we change the value of `this.name`, the value of `name` property in returned object will not be updated. So the second callback of `watch()` will not be triggered when `this.name` is changed.

**We recommend to declare all reactive data as data members of the class when it is created.**
