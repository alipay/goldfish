import deepVisit from '../src/deepVisit';
import DeepVisitBreak from '../src/DeepVisitBreak';

it('should visit all properties.', () => {
  const obj = {
    name: 'zhangsan',
    arr: [
      {
        address: 'aaa'
      },
      {
        address: {
          city: 'chengdu'
        }
      }
    ]
  };

  const result: any[] = [];
  deepVisit(obj, (_, k, po, keyPathList) => {
    result.push(keyPathList.join('.'));
    return DeepVisitBreak.NO;
  });
  expect(result).toEqual([
    'name',
    'arr',
    'arr.0',
    'arr.0.address',
    'arr.1',
    'arr.1.address',
    'arr.1.address.city'
  ]);
});

it('should handle the circle.', () => {
  const obj: any = {};
  obj.name = 'yujiang';
  obj.c = obj;
  const result: any[] = [];
  deepVisit(obj, (_, k, po, keyPathList) => {
    result.push(keyPathList.join('.'));
    return DeepVisitBreak.NO;
  });
  expect(result).toEqual(['name', 'c']);
});

it('should break all from visiting.', () => {
  const obj = {
    name: 'yujiang',
    age: 20,
  };
  const result: any[] = [];
  deepVisit(obj, (_, k, po, keyPathList) => {
    result.push(keyPathList.join('.'));
    return DeepVisitBreak.ALL;
  });
  expect(result).toEqual(['name']);
});

it('should break children from visiting.', () => {
  const obj = {
    name: 'yujiang',
    age: 20,
    address: {
      city: 'chengdu',
    },
  };
  const result: any[] = [];
  deepVisit(obj, (_, k, po, keyPathList) => {
    result.push(keyPathList.join('.'));
    if (k === 'address') {
      return DeepVisitBreak.CHILDREN;
    }
    return DeepVisitBreak.NO;
  });
  expect(result).toEqual(['name', 'age', 'address']);
});
