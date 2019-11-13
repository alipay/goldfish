# 使用状态管理

## 小程序本身的状态管理

小程序原生框架是提供了页面、组件级别的数据状态管理（`this.setData`），但是在跨页面、跨组件的场景下是没有的，通常的解决方法是将 `data` 放到 `globalData` 中，解决跨页面共享数据的问题。

可以看出是原生框架的状态管理是无法满足业务需求的，稍微复杂点的项目就会变得难以维护。

## Goldfish 响应式状态管理

在借鉴了社区优秀的框架思想之后，Goldfish 沉淀了一套适用于小程序的响应式状态管理内容，可以让使用者方便快速的处理数据状态。

### 组件的状态管理

```js
import { setupComponent, useState } from '@goldfishjs/goldfish';

Component(
  setupComponent<IProps, {}>(
    {
      // props
    },
    () => {
      const data = useState<{ hasVisible: boolean; }>({
        hasVisible: false,
      });

      return {
        data,
      };
    }
  )
);
```

在组件中直接引用即可：

```xml
<view>{{data.hasVisible}}</view>
```

### 页面的状态管理

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

在页面中直接引用即可：

```xml
<view>{{data.title}}</view>
```

### 全局的状态管理

#### 新建 Store

在根目录下的 `store` 文件夹中新建对应的 store 数据文件，统一管理：

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

#### 在 app.js 中注册

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

#### 在任意页面和组件中使用

```js
import { useGlobalData } from '@goldfishjs/goldfish';
import OrderInfo from './store/OrderInfo';

Page(
  setupPage(() => {
    // 组件中的使用也是一样的
    const globalData = useGlobalData();

    return {
      money: globalData.orderInfo.money,
    };
  }),
);
```

在页面、组件中直接引用即可：

```xml
<view>{{data.title}}</view>
```

### 更改数据

而更改数据在响应式的体系下更加的简单，只需要直接修改数据即可，所有使用到数据的地方都会同步更新：

```js
...

data.title = 'new title';

...

globalData.orderInfo.money = 200;

...
```

### 使用 computed & watch

更多的时候如果你的属性需要计算或者监听，那么可以使用 computed 和 watch，更多概念参考：[Vue Computed Properties and Watchers](https://vuejs.org/v2/guide/computed.html#ad)：

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

## 小心！响应式链断裂

在方便的使用响应式数据的同时，也要理解响应式链断裂的问题，主要表现为更改了数据，但是视图没有更新，之所以会断裂简单的来讲是因为覆盖了最顶层的对象或者返回了一个快照。

因为响应式的本质是覆写对象的 `getter` 和 `setter` 方法，如果覆写的对象都没替换成了快照，或者返回的内容变成了快照，那么将无法监听数据的变更。

常见的反例：

```js
const data = useState({
  a: 1,
});

const data2 = {
  a: 2,
};

// 直接覆盖了 data
data = data2;

return {
  data,
}
```

正确的样例：

```js
const data = useState({
  a: 1,
});

// 所有操作都在顶层上处理
data.a = 2;

return {
  data,
}
```

常见的反例 2：

```js
const data = useState({
  a: 1,
});

return {
  // 只是返回了快照
  a: data.a,
}
```

正确的样例 2：

```js
const data = useState({
  a: 1,
});

return {
  // 统一返回顶层对象
  data,
}
```

复杂点的例子：

```js
const data = useState({
  a: {
    b: {
      c: {
        x: 1,
      }
    },
  },
});

const c = {
  x: 2,
};

// 响应式链会断
data.a.b.c = c;

// 这个不会更新
c.x = 3;

return {
  data,
}
```

对于对象的处理，使用 `assign` ：

```js
const data = useState({
  a: {
    b: {
      c: {
        x: 1,
      }
    },
  },
});

const c = {
  x: 2,
};

// 使用 assgin 保证对象引用
assgin(data.a.b, c);

// 可以正确的更新
c.x = 3;

return {
  data,
}
```
