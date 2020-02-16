import { Query } from './container-router/BaseRouter';

export default interface IRoute {
  redirect(url: string, params?: Query): void;

  back(n: number, defaultUrl: string): void;

  backTo(url: string, options: {
    removeStackLength?: number;
    params?: any;
  }): void;

  replace(url: string, params?: Query): void;

  pushWindow(url: string, params?: Query): void;

  popWindow(): void;

  popTo(delta: number): void;
  /* eslint-disable semi */
}
