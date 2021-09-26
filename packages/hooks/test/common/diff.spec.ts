import diff from '../../src/common/diff';

it('should append the new array member to the end.', () => {
  expect(diff([1], [1, 2])).toEqual([{ type: 'splice', deleteCount: 0, keyPathString: '', start: 1, values: [2] }]);
  expect(diff([1], [1, 2, 3])).toEqual([
    { type: 'splice', deleteCount: 0, keyPathString: '', start: 1, values: [2, 3] },
  ]);
});

it('should remove the deleted member from the array.', () => {
  expect(diff([1, 2], [1])).toEqual([{ type: 'splice', deleteCount: 1, keyPathString: '', start: 1, values: [] }]);
});

it('should update the array member.', () => {
  expect(diff([1], [2])).toEqual([{ type: 'splice', deleteCount: 1, keyPathString: '', start: 0, values: [2] }]);
  expect(diff([1, 2, 3], [1, 3, 5])).toEqual([
    { type: 'splice', deleteCount: 2, keyPathString: '', start: 1, values: [3, 5] },
  ]);
});

it('should update the sparse array.', () => {
  const arr1 = ['a'];
  arr1[1000] = 'b';

  const arr2 = ['a', 'c'];
  arr2[1000] = 'b';

  expect(diff(arr1, arr2)).toEqual([{ type: 'splice', keyPathString: '', start: 1, deleteCount: 1, values: ['c'] }]);
});

it('should append the sparse array.', () => {
  const arr1 = ['a'];
  arr1[1000] = 'b';

  const arr2 = ['a'];
  arr2[1000] = 'b';
  arr2[2000] = 'c';

  expect(diff(arr1, arr2)).toEqual([{ type: 'splice', keyPathString: '', start: 2000, deleteCount: 0, values: ['c'] }]);
});

it('should add the new property to object.', () => {
  expect(diff({ a: 'a' }, { a: 'a', b: 'b' })).toEqual([{ type: 'set', value: { b: 'b' } }]);
  expect(diff({ a: 'a' }, { a: 'a', b: 'b', c: 'c' })).toEqual([{ type: 'set', value: { b: 'b', c: 'c' } }]);
});

it('should update the object property.', () => {
  expect(diff({ a: 'a' }, { a: 'b' })).toEqual([{ type: 'set', value: { a: 'b' } }]);
  expect(diff({ arr: [1, 2] }, { arr: 'a' })).toEqual([{ type: 'set', value: { arr: 'a' } }]);
});

it('should remove the object property.', () => {
  expect(diff({ a: 'a' }, {})).toEqual([{ type: 'set', value: { a: undefined } }]);
});

it('should handle the nested objects.', () => {
  expect(diff({ arr: [1, { a: 'a' }] }, { arr: [1, { a: 'b' }] })).toEqual([
    { type: 'set', value: { 'arr[1].a': 'b' } },
  ]);
});
