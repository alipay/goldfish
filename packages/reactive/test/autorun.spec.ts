import autorun from '../src/autorun';
import observable from '../src/observable';
import computed from '../src/computed';
import lodash from 'lodash';

describe('autorun', () => {
  it('should auto run when the value changed.', () => {
    const obj: any = {
      a: 1,
    };
    observable(obj);

    let result: number;
    let counter = 0;
    autorun(() => {
      result = obj.a;
      counter += 1;
    });
    obj.a = 2;
    return Promise.resolve().then(() => {
      expect(result).toBe(2);
      expect(counter).toBe(2);
    });
  });

  it('should auto run when the computed value changed.', () => {
    const obj = {
      name: 'diandao',
    };
    observable(obj);

    const computedObj: any = {
      name: () => {
        return `${obj.name}.zl`;
      },
    };
    computed(computedObj);

    const result: string[] = [];
    autorun(() => {
      result.push(computedObj.name);
    });

    return Promise.resolve()
      .then(() => {
        expect(result).toEqual(['diandao.zl']);
      })
      .then(() => {
        obj.name = 'yibuyisheng';
        return new Promise(resolve => {
          setTimeout(resolve);
        });
      })
      .then(() => {
        expect(result).toEqual(['diandao.zl', 'yibuyisheng.zl']);
      });
  });

  it('should not trigger autorun function when the value is not changed.', () => {
    const obj: any = {
      a: 1,
    };
    observable(obj);

    let counter = 0;
    autorun(() => {
      obj.a;
      counter += 1;
    });
    obj.a = 1;
    return Promise.resolve().then(() => {
      expect(counter).toBe(1);
    });
  });

  it('should trigger all autorun functions.', () => {
    const obj: any = {
      a: 1,
    };
    observable(obj);

    let counter = 0;
    autorun(() => {
      obj.a;
      counter += 1;
    });

    autorun(() => {
      obj.a;
      counter += 1;
    });

    expect(counter).toBe(2);

    obj.a = 2;
    return Promise.resolve().then(() => {
      expect(counter).toBe(4);
    });
  });

  it('should trigger autorun once.', () => {
    const obj: any = {
      a: 1,
      b: 2,
    };
    observable(obj);

    let counter: number = 0;
    let result: number = 0;
    autorun(() => {
      result = obj.a + obj.b;
      counter += 1;
    });
    expect(counter).toBe(1);
    expect(result).toBe(3);

    obj.a = 3;
    obj.b = 4;
    return Promise.resolve().then(() => {
      expect(counter).toBe(2);
      expect(result).toBe(7);
    });
  });

  it('should stop autorun.', () => {
    const obj: any = {
      a: 1,
    };
    observable(obj);

    let counter = 0;
    const stop = autorun(() => {
      obj.a;
      counter += 1;
    });
    expect(counter).toBe(1);
    stop();
    obj.a = 2;
    return Promise.resolve().then(() => {
      expect(counter).toBe(1);
    });
  });

  it('should collect dependencies.', () => {
    const obj: any = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    observable(obj);

    let counter = 0;
    const stop = autorun(() => {
      obj.a.b.c;
      counter += 1;
    });
    expect(counter).toBe(1);
    expect(stop.depList).not.toBe(undefined);

    let keys: string[] = [];
    if (stop.depList) {
      keys = lodash.map((stop.depList as any).list, (item: any) => item.key);
    }
    expect(keys).toEqual(['a', 'b', 'c']);
    stop();
  });

  it('should catch the error.', () => {
    const obj: any = {
      a: 1,
    };
    observable(obj);

    const error = new Error('');
    let catchedError: any;
    autorun(
      () => {
        obj.a;
        throw error;
      },
      e => {
        catchedError = e;
      },
    );
    return new Promise(resolve => {
      setTimeout(() => {
        expect(catchedError).toBe(error);
        resolve();
      });
    });
  });
});
