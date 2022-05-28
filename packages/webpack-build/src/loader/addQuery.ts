interface Options {
  output: string
  type?: string
}

export interface AssetQuery {
  resource: string
  options?: Options
}

export function addQuery(query: AssetQuery[]) {
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
