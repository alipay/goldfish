interface Options {
  output: string
  type?: string
  asConfig?: boolean
}

export interface Query {
  resource: string
  options?: Options
}

export function addQuery(query: Query[]) {
  return `
    module.export = {
      ${query.map(({ resource, options = {} }) => {
        const keys = Object.keys(options)
        const queryStr = keys.reduce((res, cur, idx) => {
          const end = keys.length - 1 === idx ? '' : '&'
          return res + `${cur}=${options[cur]}${end}`
        }, '?')

        return `
      "${resource}": require("${resource}${queryStr}")
    `
      })}
    }`
}
