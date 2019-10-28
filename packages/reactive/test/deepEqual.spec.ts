import deepEqual from '../src/deepEqual';

describe('deepEqual', () => {
  it('should compare the primary values.', () => {
    expect(deepEqual(null, null)).toBe(true);
  });

  it('should compare the primary value with object.', () => {
    expect(deepEqual({}, null)).toBe(false);
  });

  it('should compare the two objects.', () => {
    expect(deepEqual({}, {})).toBe(true);
    expect(deepEqual({ name: 'diandao' }, { name: 'diandao' })).toBe(true);
    expect(deepEqual({ name: 'diandao' }, { name: 'yibuyisheng' })).toBe(false);
  });

  it('should compare the object and the array.', () => {
    expect(deepEqual({}, [])).toBe(false);
  });

  it('should compare the non primary values recursively.', () => {
    expect(deepEqual(
      {
        name: 'diandao',
        address: {
          province: 'sichuan',
        },
      },
      {
        name: 'diandao',
        address: {
          city: 'chengdu',
        },
      },
    )).toBe(false);
  });
});
