declare global {
  /* eslint-disable @typescript-eslint/interface-name-prefix */
  interface IBridgeParamsMap {
    addNotifyListener: [
      {
        name: string;
        keep?: string;
      },
      (result: { error?: 4 | 12; [key: string]: any }) => void,
    ];
    removeNotifyListener: [
      {
        name: string;
      },
      ((result: { success: boolean; error?: 4 }) => void)?,
    ];
    postNotification: [
      {
        name: string;
        data?: Record<string, any>;
      },
      ((result: { success: boolean; error?: 4 }) => void)?,
    ];
    checkJSAPI: [
      {
        api: string;
      },
      ((result: any) => void)?,
    ];
    checkApp: [
      {
        appId: string;
        stageCode?: string;
      },
      ((result: {
        exist: boolean;
        status: 'installed' | 'uninstall';
        extStatus?: 'online' | 'uninstall' | 'installing' | 'offline';
        version?: string;
        type?: string;
      }) => void)?,
    ];
    isInstalledApp: [
      {
        scheme: string;
        packagename: string;
      },
      ((result: { installed: boolean }) => void)?,
    ];
    uploadImage: [
      {
        data: string;
        dataType?: 'dataURL' | 'fileURL' | 'localID';
        compress?: 0 | 1 | 2 | 3 | 4;
        business?: string;
        publicDomain?: boolean;
      },
      ((result: { multimediaID: string; publicUrl: string }) => void)?,
    ];
    downloadImage: [
      {
        multimediaID: string;
        business?: string;
        width?: string;
        height?: string;
        match: 0 | 1 | 2 | 3;
        quality?: string;
      },
      ((result: { data: string }) => void)?,
    ];
    httpRequest: [
      {
        url: string;
        headers?: any;
        method?: 'GET' | 'POST';
        data?: string;
        timeout?: number;
        responseType?: string;
        responseCharset?: string;
      },
      ((result: {
        data: string;
        status: number;
        headers: any;
        error?: 11 | 12 | 13 | 14;
      }) => void)?,
    ];
  }

  interface Window {
    AlipayJSBridge: {
      call: <T extends keyof IBridgeParamsMap>(name: T, ...args: IBridgeParamsMap[T]) => void;
    };
  }

  interface DocumentEventMap {
    AlipayJSBridgeReady: undefined;
    titleClick: undefined;
    subtitleClick: undefined;
    resume: { data: object; resumeParams: object };
    optionMenu: undefined;
    back: undefined;
    popMenuClick: undefined;
    firePullToRefresh: undefined;
    h5NetworkChange: {
      isConnected: boolean;
      networkType: 'wifi' | '2g' | '3g' | '4g' | 'none' | 'unknown';
    };
  }
}

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
  [K in keyof DocumentEventMap]?: ((event: DocumentEventMap[K]) => void)[];
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
