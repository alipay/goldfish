import silent from '../src/silent';

describe('Test silent', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = (): void => {};
  });
  it('Sync without error, shuold return 10', () => {
    const syncFn = (): number => 10;
    const silentSyncFn = silent(syncFn);
    expect(syncFn()).toBe(10);
    expect(silentSyncFn()).toBe(10);
  });
  it('Sync with error, the function should throw an error, the silent should not throw and return null', () => {
    const errorSyncFn = (): never => {
      throw new Error('sync error');
    };
    const silentErrorSyncFn = silent(errorSyncFn);
    expect(errorSyncFn).toThrowError('sync error');
    expect(silentErrorSyncFn).not.toThrowError();
    expect(silentErrorSyncFn()).toBeNull();
  });
  it('Async without error, shuold resolve 10', () => {
    const asyncFn = (): Promise<any> => new Promise((resolve) => {
      resolve(10);
    });
    const silentAsyncFn = silent.async(asyncFn);
    expect(asyncFn()).resolves.toBe(10);
    expect(silentAsyncFn()).resolves.toBe(10);
  });
  it('Async with error, Sync with error, the function should reject an error, the silent should not resolve null', () => {
    const errorAsyncFn = (): Promise<any> => new Promise(() => {
      throw new Error('async error');
    });
    const silentErrorAsyncFn = silent.async(errorAsyncFn);
    expect(errorAsyncFn()).rejects.toThrowError('async error');
    expect(silentErrorAsyncFn()).resolves.toBeNull();
  });
});
