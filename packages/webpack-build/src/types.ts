export interface Entry {
  type: EntryType // 入口类型
  loc: string // 当前文件位置
  name: string // 名称
  output: string // 输出位置
  pkg: string // 预留分包名称，为体积优化留坑位
  key: string // 组件 key
  value: string // 组件 value
  caller: string // 调用方
}

export enum EntryType {
  page = 'page',
  comp = 'component',
}

export interface AmpConf {
  platform: 'ali' | 'wx'
  appEntry: string
  sourceRoot: string
  outputRoot: string
  defineConstants: { [key: string]: string }
  alias: { [key: string]: string }
  style: string
  entryIncludes: string[]
  externals: { [key: string]: string }
  webpack: (config) => any
}
