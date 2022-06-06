module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      {
        onlyRemoveTypeImports: true,
      },
    ],
    [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        targets: {
          browsers: ['maintained node versions'],
        },
      },
    ],
  ],
};
