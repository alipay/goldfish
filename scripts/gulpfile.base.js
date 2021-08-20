const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const merge = require('merge2');
const path = require('path');

const sourceFiles = {
  ts: ['src/**/*.ts'],
};

const tsconfigPath = path.resolve(__dirname, '../tsconfig.json');
const tsconfig = require(tsconfigPath);

function compileTsStream(files, imports) {
  const babelOptions = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions', 'safari >= 7'],
          },
          modules: false,
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: false,
          helpers: false,
          regenerator: true,
          useESModules: false,
        },
      ],
      ...imports,
    ],
  };

  const stream = gulp.src(files, { base: 'src' }).pipe(ts.createProject(tsconfigPath)());
  const outDir = path.resolve(process.cwd(), tsconfig.compilerOptions.outDir);
  const declarationDir = tsconfig.compilerOptions.declarationDir
    ? path.resolve(path.dirname(tsconfigPath), tsconfig.compilerOptions.declarationDir)
    : outDir;
  return merge([
    stream.dts.pipe(gulp.dest(declarationDir)),
    stream.js.pipe(babel(babelOptions)).pipe(gulp.dest(outDir)),
  ]);
}

module.exports = imports => {
  gulp.task('ts', () => {
    return compileTsStream(sourceFiles.ts, imports);
  });
};
