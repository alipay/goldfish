---
sidebarDepth: 3
---

# Reactivity System

In Goldfish, we provide a reactivity system. With this system, you can write less codes to express more complex logics, and synchronize states easily.

We provide three decorators: `state`, `computed` and `observable` to turn any class to a reactive one.

## state

`state` is used to mark the normal data member to a reactive data member.

```ts
import { state } from '@goldfishjs/core';

export default class MyClass {
  @state
  public name: string = 'Yu Jiang';
}
```

The `name` is marked as a reactive data member.

## computed

`computed` is used to mark the normal getter/setter to a reactive one.

```ts
import { state } from '@goldfishjs/core';

export default class MyClass {
  @state
  public name: string = 'Yu Jiang';

  @computed
  public get fullName() {
    return `${this.name}.alilang`;
  }
}
```

The `fullName` is marked as a reactive computed data member.

## observable

`observable` is used to turn marked reactive members to real reactive ones.

```ts
import { state } from '@goldfishjs/core';

@observable
export default class MyClass {
  @state
  public name: string = 'Yu Jiang';

  @computed
  public get fullName() {
    return `${this.name}.alilang`;
  }
}
```
