/**
 * 本模块围绕 hash 路由提供了以下能力：
 * 1. 简单的序列化/反序列化查询参数功能；
 * 2. 从 hash 路径中解析出路径和参数对象；
 * 3. 管理路由历史记录。
 */
export type Query = Record<string, string | string[]>;

export type ChangeListener = (path: string, query: Query) => void;

export default abstract class BaseRouter {
  protected fromuKey = 'fromu';

  private path: string | null = '';

  private query: Query = {};

  private changeListeners: ChangeListener[] = [];

  public addChangeListener(listener: ChangeListener) {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter(l => l !== listener);
    };
  }

  public abstract redirect(url: string, params?: Query): void;

  public abstract back(n: number, defaultUrl: string): void;

  public abstract backTo(
    url: string,
    options: {
      removeStackLength?: number;
      params?: any;
    },
  ): void;

  public abstract replace(url: string, params?: Query): void;

  public abstract pushWindow(url: string, params?: Query): void;

  public abstract popWindow(): void;

  public abstract popTo(delta: number): void;

  public destroy() {}

  /**
   * 将外部路由数据同步进来
   *
   * @param [path] 路径
   * @param [query] 参数
   */
  protected change(path: string, query: Query) {
    let isChanged = false;

    if (path !== this.path) {
      this.setPath(path, true);
      isChanged = true;
    }

    if (!this.isQueryEqual(query, this.query)) {
      this.setQuery(query, true);
      isChanged = true;
    }

    isChanged && this.invokeChangeListeners();
  }

  protected getPath() {
    return this.path || '';
  }

  protected getQuery() {
    return this.query;
  }

  protected setPath(path: string, silent = false) {
    if (this.path !== path) {
      this.path = path;
      !silent && this.invokeChangeListeners();
    }
  }

  private isQueryEqual(q1: Query, q2: Query) {
    for (const key in q1) {
      if (q1[key] !== q2[key]) {
        return false;
      }
    }

    for (const key in q2) {
      if (q1[key] !== q2[key]) {
        return false;
      }
    }

    return true;
  }

  protected setQuery(query: Query, silent = false) {
    if (!this.isQueryEqual(query, this.query)) {
      this.query = query;
      !silent && this.invokeChangeListeners();
    }
  }

  private invokeChangeListeners() {
    const listeners = this.changeListeners;
    listeners.forEach(listener => {
      listener(this.path || '', this.query);
    });
  }
}
