import { IConfig } from '@goldfishjs/plugins';
import { reactive } from '@goldfishjs/composition-api';
import InitData from './InitData';

export interface IInitOptions<D> {
  data?: D;
  config?: IConfig;
}

export default class App {
  public initData = new InitData();

  public data: any = undefined;

  public config: Record<string, any> = {};

  public reactiveData: { data: Record<string, any> } = reactive({ data: {} });

  public normalData: Record<string, any> = {};

  public destroyList: (() => void)[] = [];

  public init<D extends Record<string, any>>(options: IInitOptions<D> = {}): void {
    this.data = reactive(options.data || {});
    this.config = options.config || {};
  }

  public destroy(): void {
    this.destroyList.forEach(s => s());
  }
}

export const app = new App();
