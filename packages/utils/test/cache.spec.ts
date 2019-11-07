import cache from '../src/cache';

const promiseCreator = jest.fn(
  (num = 12, error = false) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!error) {
        resolve(num);
      } else {
        reject(new Error(`${num}`));
      }
    }, 100);
  }),
);


describe('Test cache', () => {
  let cachePromiseCreator: (num?: number, error?: boolean) => Promise<any>;
  let cachePromiseCreator3000: (num?: number, error?: boolean) => Promise<any>;
  beforeEach(() => {
    promiseCreator.mockClear();
    cachePromiseCreator = cache(promiseCreator);
    cachePromiseCreator3000 = cache(promiseCreator, { time: 3000 });
  });
  it('Normal call, can get the correct result', (done) => {
    cachePromiseCreator().then((result) => {
      expect(result).toEqual(12);
      expect(promiseCreator.mock.calls.length).toEqual(1);
      done();
    });
  });
  it('Error call, can get the correct result', () => {
    expect(cachePromiseCreator(13, true)).rejects.toThrow('13');
  });
  it('Call the original function directly, the original function will be called several times', (done) => {
    const resultFn = (result: any, i: number): void => {
      expect(result).toEqual(result);
      if (i === 14) {
        expect(promiseCreator.mock.calls.length).toEqual(15);
        done();
      }
    };
    for (let i = 0; i < 15; i += 1) {
      promiseCreator().then((result) => {
        resultFn(result, i);
      });
    }
  });
  it('Multiple calls cachedFunction, the original function is called only once', (done) => {
    const resultFn = (result: any, i: number): void => {
      expect(result).toEqual(result);
      if (i === 14) {
        expect(promiseCreator.mock.calls.length).toEqual(1);
        expect(promiseCreator.mock.calls.length).not.toEqual(15);
        done();
      }
    };
    for (let i = 0; i < 15; i += 1) {
      cachePromiseCreator().then((result) => {
        resultFn(result, i);
      });
    }
  });
  describe('The default cache time 2000ms', () => {
    it('Call the cachedFunction again after 1000ms, the original function is called only once', (done) => {
      cachePromiseCreator().then(() => {
        setTimeout(() => {
          cachePromiseCreator().then((result) => {
            expect(result).toEqual(12);
            expect(promiseCreator.mock.calls.length).toEqual(1);
            done();
          });
        }, 1000);
      });
    });
    it('Call the cachedFunction again after 1000ms, The results will not change', (done) => {
      cachePromiseCreator().then(() => {
        setTimeout(() => {
          cachePromiseCreator(22).then((result) => {
            expect(result).toEqual(12);
            done();
          });
        }, 1000);
      });
    });
    it('Call the cachedFunction.forceRefresh again after 1000ms, the original function is called twice', (done) => {
      cachePromiseCreator().then(() => {
        setTimeout(() => {
          (cachePromiseCreator as any).forceRefresh().then((result: any) => {
            expect(result).toEqual(12);
            expect(promiseCreator.mock.calls.length).toEqual(2);
            done();
          });
        }, 1000);
      });
    });
    it('Call the cachedFunction.forceRefresh again after 1000ms, The results will change', (done) => {
      cachePromiseCreator().then(() => {
        setTimeout(() => {
          (cachePromiseCreator as any).forceRefresh(22).then((result: any) => {
            expect(result).toEqual(22);
            done();
          });
        }, 1000);
      });
    });
    it('Call the cachedFunction again after 2200ms, the original function is called twice', (done) => {
      cachePromiseCreator().then(() => {
        setTimeout(() => {
          cachePromiseCreator().then((result) => {
            expect(result).toEqual(12);
            expect(promiseCreator.mock.calls.length).toEqual(2);
            done();
          });
        }, 2200);
      });
    });
    it('Call the cachedFunction again after 2200ms, The results will change', (done) => {
      cachePromiseCreator(13).then((result1) => {
        expect(result1).toEqual(13);
        setTimeout(() => {
          cachePromiseCreator(22).then((result2) => {
            expect(result2).toEqual(22);
            done();
          });
        }, 2200);
      });
    });
    it('Config the cache time 3000ms, Call the cachedFunction again after 2200ms, the original function is called only once', (done) => {
      cachePromiseCreator3000().then(() => {
        setTimeout(() => {
          cachePromiseCreator3000().then((result) => {
            expect(result).toEqual(12);
            expect(promiseCreator.mock.calls.length).toEqual(1);
            done();
          });
        }, 2200);
      });
    });
  });
});
