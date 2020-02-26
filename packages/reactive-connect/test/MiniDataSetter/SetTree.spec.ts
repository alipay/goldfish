import SetTree from '../../src/MiniDataSetter/SetTree';
import LimitLeafCounter from '../../src/MiniDataSetter/LimitLeafCounter';
import * as keyPath from '../../src/MiniDataSetter/keyPath';

it('should copy the array.', () => {
  const limitLeafCounter = new LimitLeafCounter();
  const setTree = new SetTree(limitLeafCounter);
  keyPath.save(['a']);
  const arr: any[] = [];
  setTree.addNode('a', arr);
  const result = setTree.generate({});
  expect(result.a).not.toBe(arr);
  expect(result.a).toEqual(arr);
});

it('should limit the key count.', () => {
  const limitLeafCounter = new LimitLeafCounter(1);
  const setTree = new SetTree(limitLeafCounter);
  keyPath.save(['a', 'a1']);
  keyPath.save(['a', 'a2']);
  setTree.addNode('a.a1', '1');
  setTree.addNode('a.a2', '2');
  const result = setTree.generate({});
  expect(result).toEqual({
    a: {
      a1: '1',
      a2: '2',
    },
  });
});

it('should combine with the old value.', () => {
  const limitLeafCounter = new LimitLeafCounter(1);
  const setTree = new SetTree(limitLeafCounter);
  keyPath.save(['a', 'a1']);
  keyPath.save(['a', 'a2']);
  setTree.addNode('a.a1', '1');
  setTree.addNode('a.a2', '2');
  const result = setTree.generate({
    a: {
      a3: [],
    },
  });
  expect(result).toEqual({
    a: {
      a1: '1',
      a2: '2',
      a3: [],
    },
  });
});

it('should override previous value.', () => {
  const limitLeafCounter = new LimitLeafCounter();
  const setTree = new SetTree(limitLeafCounter);
  keyPath.save(['a', 'a1']);
  setTree.addNode('a.a1', '1');
  setTree.addNode('a.a1', '2');
  const result = setTree.generate({});
  expect(result).toEqual({
    'a.a1': '2',
  });
});

it('should throw an error if the value is not compatible.', () => {
  const limitLeafCounter = new LimitLeafCounter();
  const setTree = new SetTree(limitLeafCounter);
  keyPath.save(['a', 'a1']);
  setTree.addNode('a.a1', '1');
  expect(() => {
    setTree.generate({
      a: '0',
    });
  }).toThrowError();

  expect(() => {
    setTree.generate({
      a: [],
    });
  }).toThrowError();
});
