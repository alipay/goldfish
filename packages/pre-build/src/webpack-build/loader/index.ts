export const normalizeLoader = (name) => {
  return require.resolve(`@goldfishjs/pre-build/lib/webpack-build/loader/${name}`)
}

export const jsonLoader = normalizeLoader('json-loader')

export const xmlLoader = normalizeLoader('xml-loader')

export const fileLoader = normalizeLoader('file-loader')
