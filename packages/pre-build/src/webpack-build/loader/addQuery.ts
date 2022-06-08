interface Options {
  output: string;
  type?: string;
  asConfig?: boolean;
}

export interface Query {
  resource: string;
  options?: Options;
}

export function addQuery(query: Query[]) {
  const result = `
    module.export = {
      ${query.map(({ resource, options = {} }) => {
        const keys = Object.keys(options);
        const queryStr = keys.reduce((res, cur, idx) => {
          const end = keys.length - 1 === idx ? '' : '&';
          return res + `${encodeURIComponent(cur)}=${encodeURIComponent(options[cur])}${end}`;
        }, '?');

        return `
      "${resource}": require("${resource}${queryStr}")
    `;
      })}
    }`;
  return result;
}
