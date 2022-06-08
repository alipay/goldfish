export interface Entry {
  type: EntryType;
  loc: string;
  name: string;
  output: string;
  pkg: string;
  key: string;
  value: string;
  caller: string;
}

export enum EntryType {
  page = 'page',
  comp = 'component',
}
