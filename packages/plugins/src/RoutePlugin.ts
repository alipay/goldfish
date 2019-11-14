import Plugin from './Plugin';
import { default as route } from '@alipay/goldfish-route';

export default class Route extends Plugin {
  public static type = 'route';

  public init() {}

  public destroy() {}

  public reLaunch(url: string) {
    if (my.reLaunch) {
      return new Promise((resolve) => {
        my.reLaunch({
          url,
          success: resolve,
          fail: () => {
            route.pushWindow(url);
          },
        });
      });
    }

    route.pushWindow(url);
  }

  public popWindow(delta: number = 1) {
    my.navigateBack({ delta });
  }

  public popToHome() {
    route.popWindow(getCurrentPages().length - 1);
  }

  public switchTab(options: Pick<my.ISwitchTabOptions, 'url'>) {
    return new Promise((resolve, reject) => {
      my.switchTab({
        ...options,
        success: resolve,
        fail: reject,
      });
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
    route.popWindow(pages.length - targetIndex - 1);
  }
}
