import path from 'path';
import fileCache from '../../src/findMiniDependencies/fileCache';

it('should release the memory.', async () => {
  const handle = jest.fn();
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle, { cacheTime: 1 });
  await new Promise(resolve => {
    setTimeout(resolve);
  });
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle, { cacheTime: 1 });
  expect(handle.mock.calls.length).toBe(2);
});

it('should cache the result.', () => {
  const handle = jest.fn();
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle);
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle);
  expect(handle.mock.calls.length).toBe(1);
});
