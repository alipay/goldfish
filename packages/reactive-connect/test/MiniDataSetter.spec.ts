import { Count } from '../src/MiniDataSetter';

function timeout() {
  return new Promise((resolve) => {
    setTimeout(resolve);
  });
}

it('should invoke the function.', async () => {
  let counter = 0;
  const count = new Count(() => {
    counter += 1;
  });

  await Promise.all([
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
    count.set(),
  ]);
  expect(counter).toBe(1);
});

it('should invoke the function after timeout.', async () => {
  let counter = 0;
  const count = new Count(() => {
    counter += 1;
  });

  count.set();
  expect(counter).toBe(0);
  await Promise.resolve();
  count.set();
  await timeout();
  expect(counter).toBe(1);
});
