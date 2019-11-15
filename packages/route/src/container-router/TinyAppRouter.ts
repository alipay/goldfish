import StackedRouter, { format } from './StackedRouter';
import { Query } from './BaseRouter';

export default class TinyAppRouter extends StackedRouter {
  private removeChangeListener: () => void;

  public constructor() {
    super();
    this.removeChangeListener = this.addChangeListener(() => {
      const realUrl = format(this.getPath(), this.getQuery());
      my.redirectTo({
        url: realUrl,
      });
    });
  }

  public destroy() {
    super.destroy();
    this.removeChangeListener();
  }

  public pushWindow(url: string, param?: Query) {
    my.navigateTo({
      url: format(url, param),
    });
  }

  public popWindow() {
    my.navigateBack({
      delta: -1,
    });
  }

  public popTo(delta: number) {
    my.navigateBack({
      delta,
    });
  }
}
