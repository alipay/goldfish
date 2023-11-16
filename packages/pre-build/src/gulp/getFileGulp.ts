import getProcessors from "./processors/getProcessor";
import { FileGulpOptions, FileGulp } from './types'

export function getFileGulp(options: FileGulpOptions): FileGulp {
  const { souceBaseDir, excludeDistDir, type = 'mini', customFileGulp } = options;

  let sourceFiles = {}

  switch (type) {
    case 'mini':
      sourceFiles = {
        ts: [
          `${souceBaseDir}/**/*.ts`,
          `!${souceBaseDir}/**/*.d.ts`,
          '!node_modules/**',
          '!scripts/**',
          `!${excludeDistDir}`,
        ],
        less: [`${souceBaseDir}/**/*.@(less|acss)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
        js: [`${souceBaseDir}/**/*.@(js|sjs)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
        axml: [`${souceBaseDir}/**/*.@(axml)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
        json: [`${souceBaseDir}/**/*.@(json|jsonc|json5)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
        asset: [`${souceBaseDir}/**/*.@(png|svg|mp4|mp3)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
        copy: [
          // TODO: 不写一个非排除的路径, build 报错
          `${souceBaseDir}/**/*.@(xx)`,
          '!node_modules/**',
          '!scripts/**',
          `!${excludeDistDir}`,
          '!mini.project.json',
          '!package.json',
          '!tsconfig.json',
        ],
        dts: [
          `${souceBaseDir}/**/*.ts`,
          `${souceBaseDir}/**/*.d.ts`,
          '!node_modules/**',
          '!scripts/**',
          `!${excludeDistDir}`,
        ],
      };
      break;
    case 'npm':
      sourceFiles = {
        ts: ['src/**/*.@(ts|tsx)', '!src/**/*.d.ts'],
        js: ['src/**/*.@(js|jsx)'],
        axml: ['src/**/*.@(axml)'],
        json: ['src/**/*.@(json|jsonc|json5)'],
        asset: ['src/**/*.@(png|svg|mp4|mp3)'],
        less: ['src/**/*.@(acss|less)'],
        copy: ['src/**/*.@(sjs)', 'src/**/*.d.ts'],
        dts: ['src/**/*.@(ts|tsx)'],
      };
  }

  const fileGulps: FileGulp = Object.keys(sourceFiles).reduce((result, cur) => {
    const prev = result[cur];
    return {
      ...result,
      [cur]: {
        ...prev,
        glob: sourceFiles[cur],
        processors: getProcessors(cur),
      },
    };
  }, {});

  if(typeof customFileGulp === 'function') {
    return customFileGulp(fileGulps);
  }

  return { ...fileGulps, ...customFileGulp }
}
