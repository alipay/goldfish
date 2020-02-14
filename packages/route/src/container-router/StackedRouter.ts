import { parse, stringify } from 'qs';
import BaseRouter, { Query } from './BaseRouter';

export interface IStackItem {
  path: string;
  query: Query;
}

export function parseUrl(url: string) {
  const urlSplit = url.split('?');
  const query: Query = parse(urlSplit[1] || '');
  const path = urlSplit[0];
  return {
    path,
    query,
  };
}

/**
 * 格式化
 */
export function format(url: string, params?: any) {
  const { path, query } = parseUrl(url);
  const realQuery = {
    ...query,
    ...(params || {}),
  };
  const queryStr = stringify(realQuery);
  const realQueryStr = queryStr ? `?${queryStr}` : '';
  return `${path}${realQueryStr}`;
}

export default abstract class StackedRouter extends BaseRouter {
  protected fromuKey = 'fromu';

  /**
   * 重新定位到指定 hash 路径，会往 fromu 栈压入元素。
   *
   * @param {string} [url] 路径
   * @param {Object?} [params] 需要追加的参数
   */
  public redirect(url: string, params?: Query) {
    const { path, query } = parseUrl(url);
    this.change(path, {
      ...query,
      ...params,
      [this.fromuKey]: format(this.getPath(), this.getQuery()),
    });
  }

  /**
   * 回退到指定 fromu 栈层级
   *
   * @param {number} [n] 回退层级
   */
  public back(n = 1, defaultUrl = '/') {
    if (n < 0) {
      throw new Error('The back steps must be a positive integer.');
    }

    if (n === 0) {
      return;
    }

    const normalizedN = n - 1;
    const stack = this.parseFromuStack(this.getQuery());
    const targetUrl = stack[normalizedN];
    const { path, query } = parseUrl(targetUrl || defaultUrl);
    this.change(path, query);
  }

  /**
   * 回退指定层级，并且在该层级定位到另一个路径。
   * 假设当前 fromu 栈为 ['path1', 'path2', 'path3']，
   * 那么 `backTo('pathx', { removeStackLength: 2 })` 的结果就是 `#/pathx?fromu=path3`。
   *
   * @param {string} [url] 另一个需要定位到的路径
   * @param {number?} [removeStackLength] 需要移除的 fromu 栈顶元素数量
   * @param {Object?} [params] 额外追加的参数
   */
  public backTo(
    url: string,
    {
      removeStackLength = 1,
      params = {},
    }: {
      removeStackLength?: number;
      params?: any;
    } = {},
  ) {
    const normalizedRemovedStackLength = removeStackLength - 1;

    const stack = this.parseFromuStack(this.getQuery());
    const { path, query } = parseUrl(url);

    const realQuery = { ...query, ...params };
    if (stack.length > normalizedRemovedStackLength) {
      realQuery[this.fromuKey] = stack[normalizedRemovedStackLength];
    }

    this.change(path, realQuery);
  }

  public replace(url: string, params?: Query) {
    this.backTo(url, { params, removeStackLength: Number.POSITIVE_INFINITY });
  }

  public destroy() {
    super.destroy();
  }

  /**
   * 解析路径中的 fromu 栈。
   * 假设当前 hash 路径是：#/path1?a=1&fromu=path2%3Fb%3D2%26fromu%3Dpath3%253Fc%253D3，
   * 那么解析出的结果就为：['path2?b=2&fromu=path3%3Fc%3D3', 'path3?c=3']
   *
   * @param {string} [queryString] 查询参数
   * @param {Array<string>?} [stack] 解析出的栈
   * @return {Array<string>} 解析出的 formu 栈
   */
  private parseFromuStack(query: Query, stack: string[] = []): string[] {
    if (query[this.fromuKey]) {
      const fromu = query[this.fromuKey];
      if (Array.isArray(fromu)) {
        throw new Error(`do not use multiple fromu: ${JSON.stringify(query)}`);
      }
      stack.push(fromu);
      return this.parseFromuStack(parse(fromu.split('?')[1]), stack);
    }

    return stack;
  }
}
