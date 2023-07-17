import path from 'path';
import os from 'os';
import fileCache from '../../src/findMiniDependencies/fileCache';

it('should release the memory.', () => {
  jest.mock('os', () => {
    const originModule = jest.requireActual('os');
    return {
      __esModule: true,
      ...originModule,
      freemem() {
        return 0;
      },
    };
  });

  const oldRss = process.memoryUsage.rss;
  process.memoryUsage.rss = () => {
    return 1024 * 1024 * 1024 * 9;
  };

  const handle = jest.fn();
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle);
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle);
  expect(handle.mock.calls.length).toBe(2);

  process.memoryUsage.rss = oldRss;
});

it('should cache the result.', () => {
  const oldRss = process.memoryUsage.rss;
  process.memoryUsage.rss = () => {
    return 1024;
  };

  const handle = jest.fn();
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle);
  fileCache.run('group', path.resolve(__dirname, './fileCache.spec.ts'), handle);
  expect(handle.mock.calls.length).toBe(1);

  process.memoryUsage.rss = oldRss;
});
