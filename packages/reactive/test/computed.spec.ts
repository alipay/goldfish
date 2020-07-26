import computed from '../src/computed';
import observable from '../src/observable';

describe('computed', () => {
  it('should convert `computed object`.', () => {
    const obj = {
      name: () => {
        return 'diandao';
      },
    };
    computed(obj);
    expect(obj.name).toBe('diandao');
  });

  it('should convert `computed object` with setters.', () => {
    const backObj = {
      name: 'diandao',
    };
    observable(backObj);

    const obj: any = {
      name: {
        get() {
          return backObj.name;
        },
        set(v: any) {
          backObj.name = v;
        },
      },
    };
    computed(obj);
    expect(obj.name).toBe('diandao');

    obj.name = 'yibuyisheng';
    return Promise.resolve().then(() => {
      expect(obj.name).toBe('yibuyisheng');
    });
  });

  it('should synchronize with the back reactive values.', () => {
    const backObj = {
      name: 'diandao',
    };
    observable(backObj);

    let counter = 0;
    const obj: any = {
      name: {
        get() {
          counter += 1;
          return `${backObj.name}.zl`;
        },
      },
    };
    computed(obj);

    expect(obj.name).toBe('diandao.zl');
    expect(counter).toBe(1);

    backObj.name = 'yibuyisheng';
    return Promise.resolve()
      .then(() => {
        expect(obj.name).toBe('yibuyisheng.zl');
        expect(counter).toBe(2);

        backObj.name = 'yibuyisheng2009';
        return Promise.resolve();
      })
      .then(() => {
        expect(obj.name).toBe('yibuyisheng2009.zl');
        expect(counter).toBe(3);
      });
  });

  it('should synchronize with the back computed values.', () => {
    const backNormalObj = {
      name: 'diandao',
    };
    observable(backNormalObj);

    const backComputedObj: any = {
      name: {
        get: () => {
          return backNormalObj.name;
        },
        set: (v: any) => {
          backNormalObj.name = v;
        },
      },
    };
    computed(backComputedObj);

    const obj: any = {
      name: {
        get() {
          return `${backComputedObj.name}.zl`;
        },
      },
    };
    computed(obj);

    backComputedObj.name = 'yibuyisheng';
    expect(obj.name).toBe('yibuyisheng.zl');

    backNormalObj.name = 'yibuyisheng2009';
    return new Promise(resolve => setTimeout(resolve)).then(() => {
      expect(obj.name).toBe('yibuyisheng2009.zl');
    });
  });

  it('should execute once when the dependent values changed synchronously.', () => {
    const backObj = {
      name: 'diandao',
      suffix: 'zl',
    };
    observable(backObj);

    let counter = 0;
    const computedObj = {
      fullName: () => {
        counter += 1;
        return `${backObj.name}.${backObj.suffix}`;
      },
    };
    computed(computedObj);

    expect(counter).toBe(0);
    expect(computedObj.fullName).toBe('diandao.zl');
    expect(counter).toBe(1);

    backObj.name = 'yibuyisheng';
    backObj.suffix = 'zhangli';
    return Promise.resolve().then(() => {
      expect(counter).toBe(1);
      expect(computedObj.fullName).toBe('yibuyisheng.zhangli');
      expect(counter).toBe(2);
    });
  });

  it('should change the computed value when the back array changed.', () => {
    const arr: number[] = [];
    const backObj = { arr };
    observable(backObj);

    const computedObj = {
      total: () => {
        return backObj.arr.reduce((t, c) => t + c, 0);
      },
    };
    computed(computedObj);
    expect(computedObj.total).toBe(0);

    arr.push(1);
    return Promise.resolve().then(() => {
      expect(computedObj.total).toBe(1);
    });
  });

  it('should collect the dependencies information.', () => {
    const arr: number[] = [];
    const backObj = { arr };
    observable(backObj);

    const computedObj = {
      total: () => {
        return backObj.arr.reduce((t, c) => t + c, 0);
      },
    };
    computed(computedObj);
    expect(computedObj.total).toBe(0);
    expect(JSON.stringify((computedObj as any)['__reactive-cpt__'])).toBe(
      '{"total":{"list":[{"listenerList":[null],"obj":{"arr":[]},"key":"arr"}]}}',
    );

    // arr.push(1);
    // return Promise.resolve().then(() => {
    //   expect(computedObj.total).toBe(1);
    // });
  });

  it('should get the computed value immediately after setting it.', () => {
    const backObj = {
      name: 'diandao',
    };
    observable(backObj);

    const obj: any = {
      name: {
        get() {
          return backObj.name;
        },
        set(v: any) {
          backObj.name = v;
        },
      },
    };
    computed(obj);

    obj.name = 'yibuyisheng';
    expect(obj.name).toBe('yibuyisheng');
  });
});
