type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Many<T> = T | ReadonlyArray<T>;

/**
 * lodash 4.5
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable properties of `object` that are not omitted.
 *
 * @category Object
 * @param object The source object.
 * @param [paths] The property names to omit, specified
 *  individually or in arrays..
 * @returns Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
export type LodashOmit = <T extends object, K extends keyof T>(object: T | null | undefined, ...paths: Array<Many<K>>) => Omit<T, K>;

/**
* Creates an object composed of the picked `object` properties.
*
* @category Object
* @param object The source object.
* @param [props] The property names to pick, specified
*  individually or in arrays.
* @returns Returns the new object.
* @example
*
* var object = { 'a': 1, 'b': '2', 'c': 3 };
*
* _.pick(object, ['a', 'c']);
* // => { 'a': 1, 'c': 3 }
*/
export type LodashPick = <T extends object, U extends keyof T>(object: T, ...props: Array<Many<U>>) => Pick<T, U>;

/**
 * Iterates over elements of collection, returning the first element predicate returns truthy for.
 * The predicate is invoked with three arguments: (value, index|key, collection).
 *
 * @param collection The collection to search.
 * @param predicate The function invoked per iteration.
 * @param fromIndex The index to search from.
 * @return Returns the matched element, else undefined.
 */
type List<T> = ArrayLike<T>;
type ListIteratorTypeGuard<T, S extends T> = (value: T, index: number, collection: List<T>) => value is S;
export type LodashFind = <T, S extends T>(collection: List<T> | null | undefined, predicate: ListIteratorTypeGuard<T, S>, fromIndex?: number) => S|undefined;

export type PromiseCreator<T = any> = (...args: any[]) => Promise<T>;

export type FunctionType = (...args: any[]) => any

export type WithForceUpdate<T> = T & {
  forceRefresh: T;
};
