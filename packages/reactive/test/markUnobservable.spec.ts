import observable, { isObservable, markUnobservable, unmarkUnobservable } from '../src/observable';
import watchDeep from '../src/watchDeep';
import watch from '../src/watch';

it('should not convert the unobservable data.', () => {
  const data = {
    address: {
      city: 'ChengDu',
    },
  };
  markUnobservable(data.address);
  observable(data);
  expect(isObservable(data.address)).toBe(false);
});

it('should unmark the unobservable data.', () => {
  const data = {
    address: {
      city: 'ChengDu',
    },
  };
  markUnobservable(data.address);
  observable(data);
  expect(isObservable(data.address)).toBe(false);

  unmarkUnobservable(data.address);
  observable(data.address);
  expect(isObservable(data.address)).toBe(true);
});

it('should not watch the unobservable data changes.', async () => {
  const data = {
    address: {
      city: 'ChengDu',
    },
  };
  markUnobservable(data.address);
  observable(data);

  const mockFn = jest.fn();
  watch(() => data.address.city, mockFn);
  data.address.city = 'HangZhou';
  await Promise.resolve();
  expect(mockFn.mock.calls.length).toBe(0);
});

it('should watch the unobservable data changes if remove the unobservable flag.', async () => {
  const data = {
    address: {
      city: 'ChengDu',
    },
  };
  markUnobservable(data.address);
  observable(data);

  unmarkUnobservable(data.address);
  observable(data.address);

  const mockFn = jest.fn();
  watch(() => data.address.city, mockFn);
  data.address.city = 'HangZhou';
  await Promise.resolve();
  expect(mockFn.mock.calls.length).toBe(1);
});

it('should not influence other parts of the data.', async () => {
  const data = {
    address: {
      city: 'ChengDu',
    },
  };
  markUnobservable(data.address);
  observable(data);

  const mockFn = jest.fn();
  watch(() => data.address.city, mockFn);
  data.address = {
    city: 'HangZhou',
  };
  await Promise.resolve();
  expect(mockFn.mock.calls.length).toBe(1);
});

it('should not watch the unobservable parts of the data when use watchDeep.', async () => {
  const data = {
    address: {
      city: 'ChengDu',
    },
  };
  markUnobservable(data.address);
  observable(data);

  const mockFn = jest.fn();
  watchDeep(data, mockFn);
  data.address.city = 'HangZhou';
  await Promise.resolve();
  data.address = {
    city: 'HangZhou',
  };
  await Promise.resolve();
  expect(mockFn.mock.calls.length).toBe(1);
  expect(mockFn.mock.calls[0][0]).toEqual({ address: { city: 'HangZhou' } });
});
