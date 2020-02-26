import { generateKeyPathString } from '@goldfishjs/reactive';

export type KeyPathList = (string | number)[];

let cache: Record<string, KeyPathList> = {};

export function save(keyPathList: KeyPathList) {
  const keyPathString = generateKeyPathString(keyPathList);
  cache[keyPathString] = keyPathList;
  return keyPathString;
}

export function clear() {
  cache = {};
}

export function get(keyPathString: string) {
  const keyPathList = cache[keyPathString];
  if (!keyPathList) {
    throw new Error(`No such key path string: ${keyPathString}`);
  }
  return keyPathList;
}
