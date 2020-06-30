import { Query, default as BaseRouter } from './container-router/BaseRouter';
import IRoute from './IRoute';

export default abstract class Route implements IRoute {
  public path: string | null = null;

  public query: Query = {};

  protected abstract route: BaseRouter;

  protected removeChangeListener: (() => void) | undefined;

  public start() {
    this.removeChangeListener = this.route.addChangeListener((path: string, query: Query) => {
      this.path = path;
      this.query = query;
    });
  }

  public destroy() {
    if (this.removeChangeListener) {
      this.removeChangeListener();
    }
    this.route.destroy();
  }

  public redirect(url: string, params?: Query) {
    this.route.redirect(url, params);
  }

  public back(n: number, defaultUrl = '') {
    this.route.back(n, defaultUrl);
  }

  public backTo(
    url: string,
    options: {
      removeStackLength?: number;
      params?: any;
    },
  ) {
    this.route.backTo(url, options);
  }

  public replace(url: string, params?: Query) {
    this.route.replace(url, params);
  }

  public pushWindow(url: string, params?: Query) {
    this.route.pushWindow(url, params);
  }

  public popWindow() {
    this.route.popWindow();
  }

  public popTo(delta: number) {
    this.route.popTo(delta);
  }
}
