import generateKeyPathString from '../src/generateKeyPathString';

describe('generateKeyPathString', () => {
  it('should generate key path for objects.', () => {
    expect(generateKeyPathString(['a', 0, 'b'])).toBe('a[0].b');
  });

  it('should convert the property name with dots.', () => {
    expect(generateKeyPathString(['a', 'b.c', 'd'])).toBe('a["b.c"].d');
  });

  it('should convert the property name with "[" or "]".', () => {
    expect(generateKeyPathString(['a', 'b[c', 'd'])).toBe('a["b[c"].d');
    expect(generateKeyPathString(['a', 'b]c', 'd'])).toBe('a["b]c"].d');
  });

  it('should convert the property name with quotes.', () => {
    expect(generateKeyPathString(['a', 'b"c', 'd'])).toBe('a.b"c.d');
    expect(generateKeyPathString(['a', 'b".c', 'd'])).toBe('a["b\\".c"].d');
    expect(generateKeyPathString(['a', 'b"[c', 'd'])).toBe('a["b\\"[c"].d');
    expect(generateKeyPathString(['a', 'b"]c', 'd'])).toBe('a["b\\"]c"].d');
  });
});
