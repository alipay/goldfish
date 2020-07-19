import loadingCounter from '../src/loadingCounter';

const requester = (time = 200) => new Promise(resolve => setTimeout(resolve, time));

it('should record the loading count.', async () => {
  const [wrapFn, counter] = loadingCounter(() => requester(400));
  expect(counter.value).toBe(0);
  const promise = Promise.resolve(wrapFn()).then(() => expect(counter.value).toBe(0));
  expect(counter.value).toBe(0);
  setTimeout(() => {
    expect(counter.value).toBe(1);
  }, 300);
  return promise;
});
