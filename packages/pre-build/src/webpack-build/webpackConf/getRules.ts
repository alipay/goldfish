import webpack from 'webpack';

export default function getWebpackRules(): webpack.RuleSetRule[] {
  return [
    {
      test: /\.json/,
      resourceQuery: /asConfig/,
      use: [require.resolve('../loader/json-loader')],
      type: 'javascript/auto',
    },
    {
      test: /\.axml/,
      use: [require.resolve('../loader/xml-loader')],
    },
    {
      test: /\.sjs/,
      use: [require.resolve('../loader/file-loader')],
    },
  ];
}
