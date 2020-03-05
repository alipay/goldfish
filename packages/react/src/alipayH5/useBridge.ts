function ready(callback: () => void) {
  // 如果jsbridge已经注入则直接调用
  if (window.AlipayJSBridge) {
    callback && callback();
  } else {
    // 如果没有注入则监听注入的事件
    document.addEventListener('AlipayJSBridgeReady', callback, false);
  }
}

const uniqEventsMap: {
  [key in keyof DocumentEventMap]?: ((event: DocumentEventMap[key]) => void)[];
} = {
  titleClick: [],
  AlipayJSBridgeReady: [],
  subtitleClick: [],
  pause: [],
  resume: [],
  optionMenu: [],
  back: [],
  popMenuClick: [],
  firePullToRefresh: [],
  h5NetworkChange: [],
};
if (window && window.document) {
  for (const key in uniqEventsMap) {
    const fns: Function[] | undefined = (uniqEventsMap as any)[key];
    if (!fns) {
      continue;
    }
    document.addEventListener(key, function (this: any, event) {
      fns.forEach((fn) => fn.call(this, event));
    }, false);
  }
}

export const bridge = {
  addListener<T extends keyof DocumentEventMap>(
    name: T,
    fn: (event: DocumentEventMap[T]) => void,
  ) {
    const fns: Function[] | undefined = uniqEventsMap[name];
    if (fns) {
      fns.push(fn);
    } else {
      document.addEventListener(name, fn, false);
    }

    return () => {
      const fns: Function[] | undefined = uniqEventsMap[name];
      if (fns) {
        uniqEventsMap[name] = fns.filter(f => f !== fn) as any;
      } else if (window && window.document) {
        document.removeEventListener(name, fn, false);
      }
    };
  },
  call<T extends keyof IBridgeParamsMap>(name: T, ...args: IBridgeParamsMap[T]) {
    ready(() => {
      window.AlipayJSBridge.call(name, ...args);
    });
  },
};

export default function useBridge() {
  return bridge;
}
