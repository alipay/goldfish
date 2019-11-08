import asyncEach from '../src/asyncEach';


describe.skip('Test asyncEach', () => {
  it('Return the correct value', (done) => {
    const plusTen = jest.fn((input) => new Promise((resolve) => {
      setTimeout(() => {
        resolve(input + 10);
      }, 200);
    }));
    const arr = [1, 2, 3, 4, 5];
    asyncEach(arr, async (num, index) => {
      const result = await plusTen(num);
      expect(result).toBe(num + 10);
      if (index === arr.length - 1) {
        done();
      }
    });
  });
});
