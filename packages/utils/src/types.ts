export type PromiseCreator<T = any> = (...args: any[]) => Promise<T>;

export type FunctionType = (...args: any[]) => any

export type WithForceUpdate<T> = T & {
  forceRefresh: T;
};
