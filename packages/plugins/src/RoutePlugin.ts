import { route } from '@goldfishjs/route';
import Plugin, { GetPlugin } from './Plugin';
import BridgePlugin from './BridgePlugin';
import { observable, state } from '@goldfishjs/reactive-connect';

interface IPage {
  path: string;
  query?: Record<string, any>;
  referrerInfo?: any;
}

@observable
export default class Route extends Plugin {
  public static type = 'route';

  private bridge: BridgePlugin = new BridgePlugin();

  @state
  public pages: IPage[] = [];

  public async init(getPlugin: GetPlugin) {
    this.bridge = getPlugin(BridgePlugin);
  }

  public destroy() {}

  private setPages() {
    const currentPages: tinyapp.IPageInstance<any>[] = getCurrentPages();
    const newPageStack = currentPages.map((page: tinyapp.IPageInstance<any>) => ({
      path: page.route,
    }));

    // When pages stack updated, cachePages need updated page
    const newPages = newPageStack.map(
      (newPage: Pick<IPage, 'path'>) => this.pages.find((page: IPage) => page.path === newPage.path) || newPage,
    );

    this.pages = [...newPages];
  }

  public updatePages(options?: tinyapp.IAppLaunchOptions) {
    this.setPages();

    // update query
    if (!options || !options.path || !(options.query || options.referrerInfo)) return;
    const index = this.pages.findIndex((page: IPage) => page.path === options.path);
    if (index >= 0) {
      this.pages[index].query = options.query;
      this.pages[index].referrerInfo = options.referrerInfo;
    }
  }

  public async reLaunch(url: string) {
    try {
      await this.bridge.call('reLaunch', {
        url,
      });
    } catch (e) {
      route.pushWindow(url);
    }
  }

  public popWindow(delta = 1) {
    this.bridge.call('navigateBack', { delta });
  }

  public popToHome() {
    this.popWindow(getCurrentPages().length - 1);
  }

  public async switchTab(options: Pick<my.ISwitchTabOptions, 'url'>) {
    await this.bridge.call('switchTab', {
      ...options,
    });
  }

  public backToPage(page: string) {
    const pages = getCurrentPages();
    let targetIndex = -1;
    pages.some((p, index) => {
      if (p.route === page) {
        targetIndex = index;
        return true;
      }

      return false;
    });
    this.popWindow(pages.length - targetIndex - 1);
  }

  public pushWindow(...args: Parameters<typeof route['pushWindow']>) {
    return route.pushWindow(...args);
  }
}
