import * as path from 'path';
import { warn } from '@goldfishjs/pre-build/lib/utils';
import resolveModule from './resolveModule';

export default function resolveModuleInSourceDir(
  request: string,
  fromDir: string,
  projectDir: string,
): string | undefined {
  const relativeDir = fromDir.replace(`${projectDir}${path.sep}`, '');
  if (relativeDir.startsWith('node_modules')) {
    const parentProjectDir = path.dirname(projectDir);
    if (parentProjectDir === projectDir) {
      return;
    }

    const nextFromDir = path.resolve(parentProjectDir, relativeDir);
    const m = resolveModule(request, { paths: [nextFromDir] });
    if (!m) {
      return resolveModuleInSourceDir(request, nextFromDir, parentProjectDir);
    }
    return m;
  } else {
    return resolveModule(request, { paths: [fromDir] });
  }
}
