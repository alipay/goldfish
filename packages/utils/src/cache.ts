type Listener = () => void;

export interface ICacheOptions {
  /**
   * If the current execution receive an error response,
   * whether the next execution should rerun or use the error result.
   */
  shouldRerunWhenError?: boolean;
  /**
   * Cache time. Set it to -1 if you want the permanent in-memory cache.
   * The default cache time is 2000ms.
   */
  time?: number;
}

class Cache<R> {
  private loadingPromise?: Promise<R>;

  private completeTime = -1;

  private fn: () => Promise<R>;

  private options: ICacheOptions;

  public constructor(fn: () => Promise<R>, options: ICacheOptions) {
    this.fn = fn;
    this.options = options;
  }

  private isTimeout() {
    const time = this.options?.time || 2000;
    return Date.now() - this.completeTime > time;
  }

  private async waitPrevious() {
    try {
      await this.loadingPromise;
    } catch (e) {}
  }

  public async getResult(): Promise<R> {
    if (!this.loadingPromise) {
      this.loadingPromise = this.call();
      return this.loadingPromise;
    }

    // No cache.
    if (this.options?.time === -1) {
      await this.waitPrevious();
      return this.loadingPromise;
    }

    try {
      const result = await this.loadingPromise;
      if (!this.isTimeout()) {
        return result;
      }

      if (this.completeTime !== -1) {
        this.loadingPromise = undefined;
      }
      return this.getResult();
    } catch (e) {
      if (this.isTimeout() || this.options?.shouldRerunWhenError) {
        if (this.completeTime !== -1) {
          this.loadingPromise = undefined;
        }
        return this.getResult();
      }

      throw e;
    }
  }

  private call(): Promise<R> {
    return new Promise((resolve, reject) => {
      this.completeTime = -1;
      const promise = Promise.resolve(this.fn());
      promise.then(
        result => {
          this.completeTime = Date.now();
          resolve(result);
        },
        e => {
          this.completeTime = Date.now();
          reject(e);
        },
      );
    });
  }
}

export default function cache<R>(fn: () => Promise<R>, options: ICacheOptions = {}): () => Promise<R> {
  const cache = new Cache<R>(fn, options);
  return () => {
    return cache.getResult();
  };
}
