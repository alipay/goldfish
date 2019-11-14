let cacheData: Record<string, any> | undefined;

export default function setData<T>(
  key: string,
  value: any,
  realSetData: (data: Record<string, any>) => void,
) {
  if (cacheData) {
    cacheData[key] = value;
    return;
  }

  cacheData = {};
  cacheData[key] = value;
  Promise.resolve().then(() => {
    try {
      cacheData && realSetData(cacheData);
    } catch (e) {
      throw e;
    } finally {
      cacheData = undefined;
    }
  });
}
