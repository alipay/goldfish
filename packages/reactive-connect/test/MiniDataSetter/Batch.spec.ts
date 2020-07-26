import Batch from '../../src/MiniDataSetter/Batch';

function timeout() {
  return new Promise(resolve => {
    setTimeout(resolve);
  });
}

it('should wait for all promise being trigged.', () => {
  return new Promise(resolve => {
    const result: number[] = [];
    let counter = 0;
    const batch = new Batch(() => {
      counter += 1;
      expect(result).toEqual([2, 3, 4, 5]);
      resolve();

      if (counter > 1) {
        throw new Error('Wrong times.');
      }
    });

    result.push(2);
    batch.set();

    Promise.resolve().then(() => {
      result.push(3);
      batch.set();

      Promise.resolve().then(() => {
        result.push(4);
        batch.set();

        Promise.resolve().then(() => {
          result.push(5);
          batch.set();
        });
      });
    });
  });
});

it('should trigger twice when using timeout.', () => {
  return new Promise(resolve => {
    const result: number[] = [];
    let counter = 0;
    const batch = new Batch(() => {
      counter += 1;
      if (counter === 1) {
        expect(result).toEqual([2, 2.5]);
        result.splice(0, result.length);
      } else if (counter === 2) {
        expect(result).toEqual([3]);
        resolve();
      }
    });

    result.push(2);
    batch.set();

    Promise.resolve().then(() => {
      result.push(2.5);
      batch.set();
    });

    setTimeout(() => {
      result.push(3);
      batch.set();
    });
  });
});

it('should invoke the function.', async () => {
  let counter = 0;
  const count = new Batch(() => {
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
  const count = new Batch(() => {
    counter += 1;
  });

  count.set();
  expect(counter).toBe(0);
  await Promise.resolve();
  count.set();
  await timeout();
  expect(counter).toBe(1);
});
