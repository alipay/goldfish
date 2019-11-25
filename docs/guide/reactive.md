# Use State Management

> If you only want to use part of state management of Goldfish, please visit [Use state Management Progressive](./reactive-progressive.md).

## Alipay mini program State Management

The original framework of Alipay mini program provides the Page/Component level data state management ([this.setData()](https://docs.alipay.com/mini/framework/page-detail#pageprototypesetdatadata-object-callback-function)), but that is not available for Page or Component across scenarios. The general solution is to put data into globalData to solve the data sharing problem across pages.

It can be seen that basic mechanism is available for state management in the original Alipay mini program, which does not suffice the state management in complicated projects.

## Goldfish reactive State Management

On basis of the related great ideas in the community, Goldfish deposits a set of mini program friendly reactive state management framework, which enables the user to flexibly and efficiently handle the state data.

In Goldfish, state data is reactive, where the [reactive](https://vuejs.org/v2/guide/reactivity.html) data are generated with useValue(), useState(), and useComputed(). Meanwhile, the state logic module is extracted, assembled and reused on basis of function type Composition API.

### Component State Management

```js
import { setupComponent, useState } from '@goldfishjs/goldfish';

export interface IProps {
  name: string;
}

export interface IState {
  hasVisible: boolean;
}

Component(
  setupComponent<IProps>(
    {
      // Initial default props
    },
    () => {
      const data = useState<IState>({
        hasVisible: false,
      });

      return {
        data,
      };
    }
  )
);
```

Direct reference is possible in the Component:

```xml
<view>{{data.hasVisible}}</view>
```

### Page State Management

```js
import { setupPage, useState } from '@goldfishjs/goldfish';

Page(
  setupPage(() => {
    const data =
      useState <
      { title: string } >
      {
        title: 'hello goldfish',
      };

    return {
      data,
    };
  }),
);
```

Direct reference is possible in the Page:

```xml
<view>{{data.title}}</view>
```

### Global State Management

#### New Store

Create a new corresponding store data file in the store folder under the root directory for unified management:

```js
// store/OrderInfo.ts
import { observable, state, computed } from '@goldfishjs/goldfish';

@observable
export default class OrderInfo {
  @state
  public money?: number = 100;

  @computed
  public formatMoney () {
    return `¥${this.money}`;
  }
}
```

#### Register in app.js

```js
import { setupApp } from '@goldfishjs/goldfish';
import OrderInfo from './store/OrderInfo';

App(
  setupApp(config, () => {
    const data =
      useState <
      IState >
      {
        orderInfo: new OrderInfo(),
      };

    return data;
  }),
);
```

#### Use in any Page or Component

```js
import { useGlobalData } from '@goldfishjs/goldfish';
import OrderInfo from './store/OrderInfo';

Page(
  setupPage(() => {
    // Same for the use in components
    const globalData = useGlobalData();

    return {
      money: globalData.orderInfo.money,
    };
  }),
);
```

Direct reference is possible in the Page and Component:

```xml
<view>{{data.title}}</view>
```

### Change Data

To change data in the reactive system is even more simple -- just modify data directly and then all places with the data used are updated synchronously:
```js
...

data.title = 'new title';

...

globalData.orderInfo.money = 200;

...
```

### Use computed & watch

In more cases when your attributes need calculation or listen, the `computed` and `watch` can be used. For more concepts, see [Vue Computed Properties and Watchers](https://vuejs.org/v2/guide/computed.html#ad):

```js
const computed = useComputed({
  get shopTags() {
    return data.source.map(item => item.tag);
  },
});

const watch = useWatch();
watch(() => computed.shopTags, (newVal, oldVal) => {
  // when computed.shopTags changed, do something
});
```

## Caution! reactive link broken

While you are enjoying the convenience with reactive data, you may have to understand the reactive link broken problem. When a data is changed, the view is not updated. The link broken is simply because the top level object is overriden or a snapshot is returned.

The nature of reactiveness is to overwrite the `getter` and `setter` methods of the object. If the overwritten objects are not replaced with snapshot or the returned contents become snapshot, it is impossible to listen to the data change.

Common counterexample:

```js
const data = useState({
  a: 1,
});

const data2 = {
  a: 2,
};

// Overwrite data directly
data = data2;

return {
  data,
}
```

Correct example:

```js
const data = useState({
  a: 1,
});

// All operations are processed on top level
data.a = 2;

return {
  data,
}
```

Common counterexample 2:

```js
const data = useState({
  a: 1,
});

return {
  // Only snapshot is returned
  a: data.a,
}
```

Correct example 2:

```js
const data = useState({
  a: 1,
});

return {
  // Return top-level object uniformly
  data,
}
```

A more complex sample:

```js
const data = useState({
  a: {
    b: {},
  },
});

const c = {
  x: 2,
};

// reactive link broken
data.a.b.c = c;

// This will be updated
data.a.b.c.x = 3;

return {
  data,
}
```

For the object processing, use `assign`:

```js
const data = useState({
  a: {
    b: {},
  },
});

const c = {
  x: 2,
};

// For the attribute not added to object, it is required to add again before it can be gotten via the “setter” attribute
data.a.b = {
  ...data.a.b,
  c,
};

// Can be updated correctly
data.a.b.c.x = 3;

return {
  data,
}
```
