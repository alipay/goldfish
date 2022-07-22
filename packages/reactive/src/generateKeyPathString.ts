export default function generateKeyPathString(keyPathList: Readonly<(string | number)[]>, prefix?: string) {
  return keyPathList.reduce<string>((prev, cur) => {
    if (typeof cur === 'number') {
      return prev ? `${prev}[${cur}]` : `[${cur}]`;
    }

    if (/[.[\]]/.test(cur)) {
      const property = cur.replace(/"/, '\\"');
      return prev ? `${prev}["${property}"]` : `["${property}"]`;
    }

    return prev ? `${prev}.${cur}` : cur;
  }, prefix ?? '');
}
