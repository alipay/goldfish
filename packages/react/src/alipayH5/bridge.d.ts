/* eslint-disable @typescript-eslint/interface-name-prefix */
declare interface IBridgeParamsMap {
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
  [key: string]: any[];
}

declare interface Window {
  AlipayJSBridge: {
    call: <T extends keyof IBridgeParamsMap>(name: T, ...args: IBridgeParamsMap[T]) => void;
  };
}

declare interface DocumentEventMap {
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
