type Writable<T> = { -readonly [P in keyof T]: T[P] };
export default Writable;
