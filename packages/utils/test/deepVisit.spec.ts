import deepVisit from '../src/deepVisit';

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
  });
  expect(result).toEqual(['name', 'c']);
});
