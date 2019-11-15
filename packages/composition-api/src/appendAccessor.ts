export default function appendAccessor(obj: any, k: string, host: object) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, k);
  if (!descriptor || (!descriptor.get && !descriptor.set)) {
    return false;
  }

  Object.defineProperty(host, k, descriptor);
  return true;
}
