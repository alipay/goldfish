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
const path = require('path');
const plumber = require('gulp-plumber');
const alias = require('./lib/@gulp-plugin/alias/index');

const cwd = process.cwd();
const excludeDistDir = `${utils.distDir.replace(cwd + path.sep, '')}/**`;

const baseDir = utils.baseDir;

const souceBaseDir = path.relative(cwd, baseDir);
const sourceFiles = {
  ts: [`${souceBaseDir}/**/*.ts`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
  less: [`${souceBaseDir}/**/*.@(less|acss)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
  js: [`${souceBaseDir}/**/*.@(js|sjs)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
  copy: [
    `${souceBaseDir}/**/*.@(json|axml|png|svg)`,
    '!node_modules/**',
    '!scripts/**',
    `!${excludeDistDir}`,
    '!mini.project.json',
    '!package.json',
    '!tsconfig.json',
  ],
};
const npmSourceFiles = {
  ts: ['src/**/*.@(ts|tsx)', '!src/**/*.d.ts'],
  js: ['src/**/*.@(js|jsx)'],
  less: ['src/**/*.@(acss|less)'],
  copy: ['src/**/*.@(json|axml|png|svg|sjs)', 'src/**/*.d.ts'],
  dts: ['src/**/*.@(ts|tsx)'],
};

const sourceType = {
  typeMap: {},
  check(path, sourceFiles) {
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

function replaceEnv(stream) {
  let resultStream = stream;
  if (process.env.NODE_ENV) {
    resultStream = resultStream.pipe(replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV)));
  }
  if (process.env.GOLDFISH_ENV) {
    resultStream = resultStream.pipe(replace('process.env.GOLDFISH_ENV', JSON.stringify(process.env.GOLDFISH_ENV)));
  }
  return resultStream;
}

function commonStream(files, cb) {
  let stream = cb(replaceEnv(gulp.src(files, { base: baseDir })).pipe(plumber(utils.error)));
  stream = stream.pipe(gulp.dest(utils.distDir));
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

function getTSProject() {
  return utils.tsconfigPath && fs.existsSync(utils.tsconfigPath) ? ts.createProject(utils.tsconfigPath) : null;
}

function compileTSStream(files) {
  const tsProject = getTSProject();
  return commonStream(files, stream => {
    const babelConfig = getBabelConfig();
    babelConfig.presets.push([require.resolve('@babel/preset-typescript'), {}]);
    return stream.pipe(alias(tsProject.config)).pipe(babel(babelConfig));
  });
}

function compileDTSStream(files) {
  const tsProject = getTSProject();
  return commonStream(files, stream => {
    if (tsProject) {
      return stream.pipe(tsProject()).dts;
    }
    return stream.pipe(
      ts({
        skipLibCheck: true,
        types: ['mini-types'],
        declaration: true,
      }),
    ).dts;
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

gulp.task('dts', () => {
  return compileDTSStream(sourceFiles.ts);
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
    function dts() {
      return compileDTSStream(sourceFiles.ts);
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

function createDevWatcherTask(globs, sourceFiles) {
  const watcher = gulp.watch(globs, {
    ignoreInitial: true,
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
    if (sourceType.check(path, sourceFiles) === 'ts') {
      stream = compileTSStream(path);

      // handle the dts
      const dtsStream = compileDTSStream(path);
      dtsStream.once('error', e => {
        utils.error('Compile file[dts] failed:', path, e);
      });
      dtsStream.once('end', () => {
        utils.log('Compile file[dts] completed and cost ' + (Date.now() - startTime) + 'ms:', path);
      });
    } else if (sourceType.check(path, sourceFiles) === 'less') {
      stream = compileLessStream(path);
    } else if (sourceType.check(path, sourceFiles) === 'js') {
      stream = compileJSStream(path);
    } else if (sourceType.check(path, sourceFiles) === 'copy') {
      stream = copyStream(path);
    }

    if (!stream) {
      return;
    }

    stream.once('error', e => {
      utils.error('Compile file failed:', path, e);
    });
    stream.once('end', () => {
      utils.log('Compile file completed and cost ' + (Date.now() - startTime) + 'ms:', path);
    });
  }
}

gulp.task(
  'dev',
  gulp.parallel(
    function sourceCode() {
      return createDevWatcherTask(['./**/*', '!node_modules/**', '!coverage/**', `!${excludeDistDir}`], sourceFiles);
    },
    function customBlobs() {
      const blobs = getCustomBlobs() || [];
      return createDevWatcherTask(blobs, sourceFiles);
    },
  ),
);

// Compiler for npm package projects.
gulp.task(
  'npm',
  gulp.parallel(
    function ts() {
      return compileTSStream(npmSourceFiles.ts);
    },
    function js() {
      return compileJSStream(npmSourceFiles.js);
    },
    function less() {
      return compileLessStream(npmSourceFiles.less);
    },
    function copy() {
      return copyStream(npmSourceFiles.copy);
    },
    function dts() {
      return compileDTSStream(npmSourceFiles.dts);
    },
  ),
);

gulp.task('npm-dev', () => {
  return createDevWatcherTask(
    [...npmSourceFiles.ts, ...npmSourceFiles.js, ...npmSourceFiles.less, ...npmSourceFiles.copy],
    npmSourceFiles,
  );
});

exports.cwd = cwd;
exports.excludeDistDir = excludeDistDir;
exports.baseDir = baseDir;
exports.sourceFiles = sourceFiles;
exports.sourceType = sourceType;
exports.commonStream = commonStream;
exports.getTSProject = getTSProject;
