const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const merge = require('merge2');
const path = require('path');
const reactiveImportConfig = require('@alipay/goldfish-reactive/babel-plugin-import-config');

const sourceFiles = {
  ts: [
    'src/**/*.ts',
  ],
};

const tsconfigPath = path.resolve(__dirname, './src/tsconfig.json');
const tsconfig = require(tsconfigPath);

const babelOptions = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      }
    ]
  ],
  plugins: [
    // 由于 babel-plugin-import 不能处理 class extends 的情况，导致基类的 import 语句缺失，
    // 所以此处将 class 语法转一下，绕过这个 bug。
    ['@babel/plugin-transform-classes'],
    ['@babel/plugin-transform-runtime'],
    [
      'import',
      reactiveImportConfig,
      'reactive',
    ],
  ],
};

function compileTsStream(files) {
  const stream = gulp.src(files, { base: 'src' }).pipe(ts.createProject(tsconfigPath)());
  const declarationDir = path.resolve(path.dirname(tsconfigPath), tsconfig.compilerOptions.declarationDir);
  const outDir = path.resolve(path.dirname(tsconfigPath), tsconfig.compilerOptions.outDir);
  return merge([
    stream.dts.pipe(gulp.dest(declarationDir)),
    stream.js
      .pipe(babel(babelOptions))
      .pipe(gulp.dest(outDir)),
  ]);
}

gulp.task('ts', () => {
  return compileTsStream(sourceFiles.ts);
});
