import requestingCounter from '../src/requestingCounter';

const requester = () => new Promise(resolve => setTimeout(resolve, 200));

it('should record the requesting count.', async () => {
  const [wrapFn, counter] = requestingCounter(requester);
  expect(counter.value).toBe(0);
  const promise = Promise.resolve(wrapFn()).then(() => expect(counter.value).toBe(0));
  expect(counter.value).toBe(1);
  return promise;
});
