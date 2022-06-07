export function normalizeCompPath(name: string) {
  return `/components/${name}/index`;
}

export function isRelativeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (/^.+:\/\//.test(url)) return false;
  if (/\{\{((?:.|\n|\r)+?)\}\}(?!})/.test(url)) return false;
  return true;
}

export function createRelativePath(path: string) {
  return /^\./.test(path) ? path : './' + path;
}

export function jsonModule(source: Record<string, any>) {
  return `
  var json = ${JSON.stringify(source, null, 2)};
  module.exports = JSON.stringify(json, null, 2);\n
`;
}
