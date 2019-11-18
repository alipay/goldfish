export default function generateKeyPathString(keyPathList: (string | number)[]) {
  return keyPathList.reduce<string>(
    (prev, cur) => {
      if (typeof cur === 'number') {
        return prev ? `${prev}[${cur}]` : `[${cur}]`;
      }

      if (/[.\[\]]/.test(cur)) {
        throw new Error(`There is special characters in the key: ${cur}, and the full key path array is: ${keyPathList}`);
      }
      return prev ? `${prev}.${cur}` : cur;
    },
    '',
  );
}
