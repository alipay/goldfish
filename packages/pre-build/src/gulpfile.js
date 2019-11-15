const gulp = require('gulp');
const ts = require('gulp-typescript');
const less = require('gulp-less');
const NpmImportPlugin = require('less-plugin-npm-import');
const postcss = require('gulp-postcss');
const fs = require('fs');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const getBabelConfig = require('./getBabelConfig');
const utils = require('./utils');

const sourceFiles = {
  ts: ['**/*.ts', '!node_modules/**', '!dist/**'],
  less: ['**/*.@(less|acss)', '!node_modules/**', '!dist/**'],
  js: ['**/*.js', '!node_modules/**', '!dist/**'],
  copy: [
    '**/*.@(json|axml|png|svg)',
    '!node_modules/**',
    '!dist/**',
    '!mini.project.json',
    '!package.json',
  ],
};

function compileJSStream(files) {
  return gulp
    .src(files, { base: '.' })
    .pipe(
      replace('./assets/', function() {
        return `/${this.file.relative.replace(this.file.basename, '')}assets/`;
      }),
    )
    .pipe(gulp.dest('dist/'));
}

function compileTSStream(files) {
  return gulp
    .src(files, { base: '.' })
    .pipe(ts.createProject('./tsconfig.json')())
    .on('error', function(error) {
      utils.error(error);
      this.emit('end');
    })
    .pipe(babel(getBabelConfig(process.env.NODE_ENV)))
    .pipe(gulp.dest('dist/'));
}

function compileLessStream(files) {
  return gulp
    .src(files, { base: '.' })
    .pipe(
      less({
        javascriptEnabled: true,
        plugins: [new NpmImportPlugin({ prefix: '~' })],
      }),
    )
    .pipe(
      postcss(file => {
        return {
          plugins: [
            require('autoprefixer')({}),
            require('postcss-px-to-viewport')({
              viewportWidth: /mini-antui/.test(file.relative) ? 750 / 2 : 750,
            }),
          ],
        };
      }),
    )
    .pipe(
      rename({
        extname: '.acss',
      }),
    )
    .pipe(gulp.dest('dist/'));
}

function copyStream(files) {
  return gulp.src(files, { base: '.' }).pipe(gulp.dest('dist/'));
}

gulp.task('ts', () => {
  return compileTSStream(sourceFiles.ts);
});

gulp.task('js', () => {
  return compileJSStream(sourceFiles.js);
});

gulp.task('less', () => {
  return compileLessStream(sourceFiles.less);
});

gulp.task('copy', () => {
  return copyStream(sourceFiles.copy);
});

gulp.task(
  'all',
  gulp.parallel(
    function ts() {
      return compileTSStream(sourceFiles.ts);
    },
    function js() {
      return compileJSStream(sourceFiles.js);
    },
    function less() {
      return compileLessStream(sourceFiles.less);
    },
    function copy() {
      return copyStream(sourceFiles.copy);
    },
  ),
);
