export interface IIndexedObject {
  [key: string]: any;
}

export function isArray(v: any): v is any[] {
  return Array.isArray(v);
}

let id = 0;
export function genId() {
  id += 1;
  return id;
}
