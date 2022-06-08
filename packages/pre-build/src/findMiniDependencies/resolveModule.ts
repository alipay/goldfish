import resolve from 'enhanced-resolve';

export default function resolveModule(request: string, options?: { paths?: string[] }) {
  const paths = options?.paths || [process.cwd()];

  for (let i = 0, il = paths.length; i < il; i++) {
    try {
      return resolve.sync(paths[i], request) || undefined;
    } catch {
      continue;
    }
  }

  return;
}
