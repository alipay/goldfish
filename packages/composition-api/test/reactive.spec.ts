import reactive from '../src/reactive';

describe('reactive', () => {
  it('should update the nested computed value.', () => {
    const obj = reactive({
      get c() {
        return {
          c: {
            b: this.b,
          },
        };
      },
      get b() {
        return { b: this.a };
      },
      a: 1,
    });
    expect(obj.c.c.b.b).toBe(1);
    obj.a = 2;
    expect(obj.c.c.b.b).toBe(2);
    obj.a = 3;
    expect(obj.c.c.b.b).toBe(3);
  });
});
