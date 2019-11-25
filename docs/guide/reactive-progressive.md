# Use State Management Progressive

> If you want to use whole Goldfish state Management, please visit [Use state Management](./reactive.md).

## Alipay mini program State Management

The original framework of Alipay mini program provides the Page/Component level data state management ([this.setData()](https://docs.alipay.com/mini/framework/page-detail#pageprototypesetdatadata-object-callback-function)), but that is not available for Page or Component across scenarios. The general solution is to put data into `globalData` to solve the data sharing problem across pages.

It can be seen that basic mechanism is available for state management in the original Alipay mini program, which is not satisfied with the state management in complicated projects.

## Goldfish Reactive State Management

On basis of the related great ideas in the community, Goldfish deposits a set of mini program friendly reactive state management framework, which enables the user to flexibly and efficiently handle the state data.

In Goldfish, state data is reactive, you can use `observable`, `state`, `computed` to create reactive data, and use `AppStore` `PageStore` `ComponentStore` declare store, then use `createApp` `createPage` `createComponent` to connect the store with the view instance (Page, Component, or App).

### Component State Management

```js
// store.js
import { observable, state } from '@goldfishjs/reactive-connect';
import { ComponentStore } from '@goldfishjs/core';

class MyComponentStore extends ComponentStore {
  props = state({});
  closeCount = state(0);
}

export default observable(MyComponentStore);
```

```js
// component.js
import { createComponent } from '@goldfishjs/core';
import store from './store';

Component(createComponent(store, {
  didMount() {},
  methods: {
    onPopupClose(event) {
      // reactive data
      this.store.closeCount++;
    },
  }
}));
```

Direct reference is available in the component:

```xml
<view>{{closeCount}}</view>
```

### Page State Management

```js
// store.js
import { observable, state } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  list = state([
    {
      title: 'test',
      brief: 'brief',
    },
  ]);
}
```

```js
import { createPage } from '@goldfishjs/core';
import store from './store';

// Observable page store to reactive
Page(createPage(store, {
  onLoad() {
    // update data
    this.store.list.push({
      title: 'test2',
      brief: 'brief2',
    });
  },
}));
```

Direct reference is available in the Page:

```xml
<list>
  <block a:for="{{list}}">
    <list-item
      data-item="{{item}}"
    >
      {{item.title}}
      <view class="am-list-brief">{{item.brief}}</view>
    </list-item>
  </block>
</list>
```

### Global State Management

#### App Store

Create a new corresponding store data file in the store folder under the root directory for unified management:

```js
// appStore.js
import { observable, state } from '@goldfishjs/reactive-connect';
import { AppStore } from '@goldfishjs/core';

class MyAppStore extends AppStore {
  currentShop = state({});
}

export default observable(MyAppStore);
```

#### Register in app.js

```js
import { createApp } from '@goldfishjs/core';
import MyAppStore from './appStore';

const appConfig = {};

App(createApp(appConfig, MyAppStore, {
  onLaunch(options) {
  },
  onShow(options) {
  },
}));
```

#### Use in any Page or Component

```js
// store.js (Page or Component)
import { observable, computed } from '@goldfishjs/reactive-connect';
import { PageStore } from '@goldfishjs/core';

class MyPageStore extends PageStore {
  currentShop = computed(() => this.globalStore.currentShop);
}

export default observable(MyPageStore);
```

When connect store to Page, directly reference is available in the Page and Component:

```xml
<view>{{currentShop}}</view>
```

### Change Data

To change data in the reactive system is even more simple - just modify data directly and then all places with the data used are updated synchronously:
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
class MyPageStore extends PageStore {
  currentShop = computed(() => this.globalStore.currentShop);
}
```

```js
...
async onLoad() {
  // Watching this.store.loading
  // When this.store.loading change, show loading toast.
  this.store.watch(
    () => this.store.loading,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue) {
          my.showToast({
            content: 'loading...',
          });
        } else {
          my.hideLoading();
        }
      }
  });

  // Get data when page onload
  await this.store.getList();
}
```

Other details please visit: [boilerplate-progressive-js](https://github.com/alipay/goldfish/tree/master/packages/boilerplate-progressive-js).
