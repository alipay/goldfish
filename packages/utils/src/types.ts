// export type PromiseCreator<T = any> = (...args: any[]) => Promise<T>;

// export type WithForceUpdate<T> = T & {
//   forceRefresh: T;
// };

declare namespace GoldFishUtils {
  export type PromiseCreator<T = any> = (...args: any[]) => Promise<T>;
  export type WithForceUpdate<T> = T & {
    forceRefresh: T;
  };
}

export default GoldFishUtils;
