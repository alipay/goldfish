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
const alias = require('./lib/@gulp-plugin/alias/index');
const {
  cwd,
  excludeDistDir,
  baseDir,
  sourceFiles,
  sourceType,
  commonStream: baseCommonStream,
  getTSProject,
} = require('./gulpfile');

function commonStream(files, cb) {
  return baseCommonStream(files, pdsCustomHandle(cb));
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

function compileTSStream(files) {
  const tsProject = getTSProject();
  return commonStream(
    files,
    stream => {
      const babelConfig = getBabelConfig();
      babelConfig.presets.push([require.resolve('@babel/preset-typescript'), {}]);
      return stream.pipe(alias(tsProject.config)).pipe(babel(babelConfig));
    },
  );
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

function createDevWatcherTask(globs, onComplete) {
  const watcher = gulp.watch(globs, {
    ignoreInitial: true,
  });
  watcher.on('change', path => sourceUpdateHandler(path, onComplete));
  watcher.on('add', path => sourceUpdateHandler(path, onComplete));
  watcher.on('unlink', path => {
    let targetPath = utils.getCompiledPath(path, sourceType);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      onComplete && onComplete(path);
      utils.log(`Remove file successfully: ${targetPath}.`);
    }
  });
  return new Promise((resolve) => {
    watcher.on('close', resolve);
  });

  function sourceUpdateHandler(path, onComplete) {
    let callbackCounter = 1;
    const checkComplete = () => {
      callbackCounter--;
      if (callbackCounter <= 0) {
        onComplete && onComplete(path);
      }
    };

    const startTime = Date.now();
    let stream;
    if (sourceType.check(path, sourceFiles) === 'ts') {
      callbackCounter = 2;
      stream = compileTSStream(path);

      // handle the dts
      const dtsStream = compileDTSStream(path);
      dtsStream.once('error', e => {
        utils.error('Compile file[dts] failed:', path, e);
      });
      dtsStream.once('end', () => {
        utils.log('Compile file[dts] completed and cost ' + (Date.now() - startTime) + 'ms:', path);
        checkComplete();
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
      checkComplete();
    });
  }
}

// PDS Custom
function pdsCustomHandle(cb) {
  const prefixRE = /^GOLDFISH_APP/;

  const envs = Object.create(null);
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      envs[key] = process.env[key];
    }
  });

  return stream => {
    stream = Object.entries(envs).reduce((_stream, [key, value]) => {
      return _stream.pipe(replace(`process.env.${key}`, JSON.stringify(value)));
    }, stream);

    return cb(stream);
  };
}

gulp.task(
  'all-pds',
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

gulp.task(
  'dev-pds',
  gulp.parallel(
    function sourceCode() {
      return createDevWatcherTask(
        [
          './**/*',
          '!node_modules/**',
          '!coverage/**',
          `!${excludeDistDir}`
        ],
        utils.execCallback,
      );
    },
    function customBlobs() {
      const blobs = getCustomBlobs() || [];
      return createDevWatcherTask(blobs, utils.execCallback);
    },
  ),
);
