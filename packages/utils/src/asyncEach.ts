async function asyncEach<T>(
  arr: T[],
  callback: (result: T, index?: number, fullArray?: T[]) => Promise<any>,
): Promise<any> {
  for (let i = 0; i < arr.length; i += 1) {
    await callback(arr[i], i, arr);
  }
}

export default asyncEach;
