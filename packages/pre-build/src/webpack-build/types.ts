export interface BuildOptions {
  platform: 'ali' | 'wx';
  appEntry: string;
  sourceRoot: string;
  outputRoot: string;
  defineConstants: { [key: string]: string };
  alias: { [key: string]: string };
  style: string;
  entryIncludes: string[];
  externals: { [key: string]: string };
  webpack(config: any): any;
}

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
