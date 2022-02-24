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
const micromatch = require('micromatch');
const gulpFilter = require('gulp-filter');
const merge = require('merge2');
const path = require('path');
const plumber = require('gulp-plumber');

const cwd = process.cwd();
const excludeDistDir = `${utils.distDir.replace(cwd + '/', '')}/**`;

const baseDir = utils.baseDir;

const sourceFiles = {
  ts: ['**/*.ts', '!node_modules/**', `!${excludeDistDir}`],
  less: ['**/*.@(less|acss)', '!node_modules/**', `!${excludeDistDir}`],
  js: ['**/*.js', '!node_modules/**', `!${excludeDistDir}`],
  copy: [
    '**/*.@(json|axml|png|svg)',
    '!node_modules/**',
    `!${excludeDistDir}`,
    '!mini.project.json',
    '!package.json',
    '!tsconfig.json',
  ],
};

const sourceType = {
  typeMap: {},
  check(path) {
    if (path in this.typeMap) {
      return this.typeMap[path];
    }

    if (micromatch([path], sourceFiles.ts).length) {
      this.typeMap[path] = 'ts';
    } else if (micromatch([path], sourceFiles.less).length) {
      this.typeMap[path] = 'less';
    } else if (micromatch([path], sourceFiles.js).length) {
      this.typeMap[path] = 'js';
    } else if (micromatch([path], sourceFiles.copy).length) {
      this.typeMap[path] = 'copy';
    }

    return this.typeMap[path];
  },
};

function commonStream(files, cb) {
  const compiledFiles = [];
  let stream = cb(
    gulp
      .src(files, { base: baseDir })
      .pipe(plumber(utils.error))
      .pipe(
        gulpFilter(file => {
          const result = utils.shouldCompileFile(file.path, sourceType);
          if (result) {
            compiledFiles.push(file.path);
          }
          return result;
        }),
      ),
  );

  stream = stream.pipe(gulp.dest(utils.distDir));

  stream.on('end', () => {
    compiledFiles.forEach(f => utils.recordFileUpdateTime(f));
  });
  return stream;
}

function compileJSStream(files) {
  return commonStream(files, stream => {
    return stream.pipe(
      replace('./assets/', function () {
        return `/${this.file.relative.replace(this.file.basename, '')}assets/`;
      }),
    );
  });
}

const tsconfigPath = utils.tsconfigPath;
const tsconfig = require(tsconfigPath);
function compileTSStream(files) {
  const projectDir = path.dirname(tsconfigPath);
  const declarationDir = path.resolve(
    projectDir,
    tsconfig.compilerOptions.declarationDir || path.resolve(projectDir, 'types'),
  );
  if (tsconfig.compilerOptions.outDir) {
    utils.warn(`The outDir config in ${tsconfigPath} will not work, and the real outDir is: ${utils.distDir}`);
  }

  return commonStream(files, stream => {
    const s = stream.pipe(ts.createProject(tsconfigPath)());
    if (tsconfig.compilerOptions.declaration) {
      return merge([s.dts.pipe(gulp.dest(declarationDir)), s.js.pipe(babel(getBabelConfig()))]);
    }
    return s.js.pipe(babel(getBabelConfig()));
  });
}

function compileLessStream(files) {
  return commonStream(files, stream => {
    return stream
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
      );
  });
}

function copyStream(files) {
  return gulp.src(files, { base: baseDir }).pipe(gulp.dest(utils.distDir));
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

function getCustomBlobs() {
  try {
    const miniJson = require(`${cwd}/mini.project.json`);
    const includePackages = miniJson['custom_watch_blobs_in_dev'];
    if (!includePackages || !includePackages.length) {
      return;
    }
    return includePackages;
  } catch (e) {
    utils.warn(e);
  }
}

function createDevWatcherTask(globs) {
  const watcher = gulp.watch(globs, {
    ignoreInitial: false,
  });
  watcher.on('change', sourceUpdateHandler);
  watcher.on('add', sourceUpdateHandler);
  watcher.on('unlink', path => {
    let targetPath = utils.getCompiledPath(path, sourceType);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      utils.log(`Remove file successfully: ${targetPath}.`);
    }
  });
  return watcher;

  function sourceUpdateHandler(path) {
    const startTime = Date.now();
    let stream;
    if (sourceType.check(path) === 'ts') {
      stream = compileTSStream(path);
    } else if (sourceType.check(path) === 'less') {
      stream = compileLessStream(path);
    } else if (sourceType.check(path) === 'js') {
      stream = compileJSStream(path);
    } else if (sourceType.check(path) === 'copy') {
      stream = copyStream(path);
    }

    if (!stream) {
      return;
    }

    stream.once('error', e => {
      utils.error('Compile file failed:', path, e);
    });
    stream.once('end', () => {
      utils.log('Compile file successfully and cost ' + (Date.now() - startTime) + 'ms:', path);
    });
  }
}

gulp.task(
  'dev',
  gulp.parallel(
    function sourceCode() {
      return createDevWatcherTask(['./**/*', '!node_modules/**', '!coverage/**', `!${excludeDistDir}`]);
    },
    function customBlobs() {
      const blobs = getCustomBlobs() || [];
      return createDevWatcherTask(blobs);
    },
  ),
);

// Compiler for npm package projects.
gulp.task(
  'npm',
  gulp.parallel(
    function ts() {
      return compileTSStream(['src/**/*.@(ts|tsx)']);
    },
    function js() {
      return compileJSStream(['src/**/*.@(js|jsx)']);
    },
    function less() {
      return compileLessStream(['src/**/*.@(acss|less)']);
    },
    function copy() {
      return copyStream(['src/**/*.@(json|axml|png|svg)']);
    },
  ),
);
