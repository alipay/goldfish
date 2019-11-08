import takeLatest from '../src/takeLatest';

const promiseCreator = jest.fn(
  (num = 12, time = 100) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(num);
    }, time);
  }),
);


describe.skip('Test takeLatest', () => {
  let takeLatestPromiseCreator: (num?: number, time?: number) => Promise<any>;
  beforeEach(() => {
    promiseCreator.mockClear();
    takeLatestPromiseCreator = takeLatest(promiseCreator);
  });
  it('Normal call, can get the correct result', (done) => {
    takeLatestPromiseCreator().then((result) => {
      expect(result).toBe(12);
      expect(promiseCreator.mock.calls.length).toBe(1);
      done();
    });
  });
  it('Call original function return the last return result', (done) => {
    let originalResult: number;
    const resultFn = jest.fn((n) => {
      originalResult = n;
    });
    promiseCreator(13, 1500).then((result) => {
      resultFn(result);
    });
    promiseCreator(12, 300).then((result) => {
      resultFn(result);
    });
    setTimeout(() => {
      expect(originalResult).toBe(13);
      expect(resultFn.mock.calls.length).toBe(2);
      done();
    }, 2000);
  });
  it('Call twice return the last call result', (done) => {
    let originalResult: number;
    const resultFn = jest.fn((n) => {
      originalResult = n;
    });
    takeLatestPromiseCreator(13, 1500).then((result) => {
      resultFn(result);
    });
    takeLatestPromiseCreator(12, 300).then((result) => {
      resultFn(result);
    });
    setTimeout(() => {
      expect(originalResult).toBe(12);
      expect(resultFn.mock.calls.length).toBe(1);
      done();
    }, 2000);
  });
});
