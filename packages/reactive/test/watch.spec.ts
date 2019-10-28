import observable from '../src/observable';
import watch from '../src/watch';
import computed from '../src/computed';

describe('watch', () => {
  it('should watch.', () => {
    const obj = {
      name: 'diandao',
    };
    observable(obj);

    let result: any;
    watch(
      () => {
        return `${obj.name}.zl`;
      },
      (data: any) => {
        result = data;
      },
    );
    expect(result).toBe(undefined);
    obj.name = 'yibuyisheng';
    return Promise.resolve().then(() => {
      expect(result).toBe('yibuyisheng.zl');
    });
  });

  it('should not trigger the callback after unwatching.', () => {
    const obj = {
      name: 'diandao',
    };
    observable(obj);

    let result: any;
    const unwatch = watch(
      () => {
        return `${obj.name}.zl`;
      },
      (data: any) => {
        result = data;
      },
    );
    expect(result).toBe(undefined);
    obj.name = 'yibuyisheng';
    return Promise.resolve().then(() => {
      expect(result).toBe('yibuyisheng.zl');

      unwatch();
      obj.name = 'yibuyisheng2009';
      expect(result).toBe('yibuyisheng.zl');
    });
  });

  it('should watch the computed values.', () => {
    const backObj = {
      name: 'diandao',
    };
    observable(backObj);

    const computedObj: any = {
      name: () => {
        return `${backObj.name}.zl`;
      },
    };
    computed(computedObj);

    let result: any;
    watch(
      () => {
        return computedObj.name;
      },
      (data: any) => {
        result = data;
      },
    );
    expect(result).toBe(undefined);

    backObj.name = 'yibuyisheng';
    return Promise.resolve().then(() => {
      expect(computedObj.name).toBe('yibuyisheng.zl');
      return Promise.resolve();
    }).then(() => {
      expect(result).toBe('yibuyisheng.zl');
    });
  });

  it('should not invoke the callback when the function result is not changed.', () => {
    const obj = {
      a: 1,
      b: 2,
    };
    observable(obj);

    let result: number | undefined;
    let counter = 0;
    watch(
      () => {
        return obj.a + obj.b;
      },
      (data: any) => {
        result = data;
        counter += 1;
      },
    );

    obj.a = 2;
    obj.b = 1;

    return Promise.resolve().then(() => {
      expect(result).toBe(undefined);
      expect(counter).toBe(0);

      obj.a = 3;
      obj.b = 4;

      return Promise.resolve();
    }).then(() => {
      expect(result).toBe(7);
      expect(counter).toBe(1);
    });
  });

  it('should invoke the callback immediately if setting the immediate option to `true`.', () => {
    const obj = {
      a: 1,
      b: 2,
    };
    observable(obj);

    let result: number | undefined;
    watch(
      () => {
        return obj.a + obj.b;
      },
      (data: any) => {
        result = data;
      },
      {
        immediate: true,
      },
    );

    return Promise.resolve().then(() => {
      expect(result).toBe(3);
    });
  });

  it('should catch the error.', () => {
    const obj = {};
    observable(obj);

    const error = new Error('');
    let catchedError: any;
    watch(
      () => {
        throw error;
      },
      () => {
        throw error;
      },
      {
        immediate: true,
        onError(e) {
          catchedError = e;
        },
      },
    );

    return Promise.resolve().then(() => {
      expect(catchedError).toBe(error);
    });
  });

  it('should watch deeply when the `deep` is set to `true`.', () => {
    const obj = {
      address: {
        province: 'Sichuan',
        city: 'Chengdu',
        house: {
          street: 'xxx',
          number: '103',
        },
      },
    };
    observable(obj);

    let counter = 0;
    watch(
      () => obj.address,
      () => {
        counter += 1;
      },
      {
        deep: true,
      },
    );
    obj.address.house.number = '104';
    return Promise.resolve().then(() => {
      expect(counter).toBe(1);
      expect(obj.address.house.number).toBe('104');
    });
  });

  it('should detect array push.', () => {
    const obj: { students: any[] } = {
      students: [],
    };
    observable(obj);

    let counter = 0;
    watch(
      () => obj.students,
      () => {
        counter += 1;
      },
    );
    obj.students.push({});
    return Promise.resolve().then(() => {
      expect(counter).toBe(1);
      expect(obj.students.length).toBe(1);
    });
  });

  it('should not be undefined when the first time access `stop`.', async () => {
    const obj: { students: any[] } = {
      students: [],
    };
    observable(obj);
    return new Promise((resolve) => {
      const stop = watch(
        () => obj.students,
        () => {
          expect(stop).not.toBeUndefined();
          resolve();
        },
        {
          immediate: true,
        },
      );
    });
  });
});
