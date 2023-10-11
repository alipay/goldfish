const gulp = require('gulp');
const fs = require('fs');
const utils = require('./utils');
const micromatch = require('micromatch');
const path = require('path');
const { processors } = require('./processors');

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

function complieProcess(files, type) {
  return processors[type].reduce(
    (stream, processor) => stream.pipe(processor.handler()),
    gulp.src(files, { base: baseDir }),
  );
}

gulp.task('ts', () => {
  return complieProcess(sourceFiles.ts, 'ts');
});

gulp.task('js', () => {
  return complieProcess(sourceFiles.js, 'js');
});

gulp.task('less', () => {
  return complieProcess(sourceFiles.less, 'less');
});

gulp.task('copy', () => {
  return complieProcess(sourceFiles.copy, 'copy');
});

gulp.task('dts', () => {
  return complieProcess(sourceFiles.ts, 'dts');
});

gulp.task(
  'all',
  gulp.parallel(
    function ts() {
      return complieProcess(sourceFiles.ts, 'ts');
    },
    function js() {
      return complieProcess(sourceFiles.js, 'js');
    },
    function less() {
      return complieProcess(sourceFiles.less, 'less');
    },
    function copy() {
      return complieProcess(sourceFiles.copy, 'copy');
    },
    function dts() {
      return complieProcess(sourceFiles.ts, 'dts');
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

function createDevWatcherTask(globs, sourceFiles, onComplete) {
  const watcher = gulp.watch(globs, {
    ignoreInitial: true,
  });
  watcher.on('change', sourceUpdateHandler);
  watcher.on('add', sourceUpdateHandler);
  watcher.on('unlink', path => {
    let targetPath = utils.getCompiledPath(path, sourceType, sourceFiles);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      onComplete && onComplete(path);
      utils.log(`Remove file successfully: ${targetPath}.`);
    }
  });
  return new Promise(resolve => {
    watcher.on('close', resolve);
  });

  function sourceUpdateHandler(path) {
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
      stream = complieProcess(path, 'ts');

      // handle the dts
      const dtsStream = complieProcess(path, 'dts').dts;
      dtsStream.once('error', e => {
        utils.error('Compile file[dts] failed:', path, e);
      });
      dtsStream.once('end', () => {
        utils.log('Compile file[dts] completed and cost ' + (Date.now() - startTime) + 'ms:', path);
        checkComplete();
      });
    } else if (sourceType.check(path, sourceFiles) === 'less') {
      stream = complieProcess(path, 'less');
    } else if (sourceType.check(path, sourceFiles) === 'js') {
      stream = complieProcess(path, 'js');
    } else if (sourceType.check(path, sourceFiles) === 'copy') {
      stream = complieProcess(path, 'copy');
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
      return complieProcess(npmSourceFiles.ts, 'ts');
    },
    function js() {
      return complieProcess(npmSourceFiles.js, 'js');
    },
    function less() {
      return complieProcess(npmSourceFiles.less, 'less');
    },
    function copy() {
      return complieProcess(npmSourceFiles.copy, 'copy');
    },
    function dts() {
      return complieProcess(npmSourceFiles.dts, 'dts');
    },
  ),
);

gulp.task('npm-dev', () => {
  return createDevWatcherTask(
    [...npmSourceFiles.ts, ...npmSourceFiles.js, ...npmSourceFiles.less, ...npmSourceFiles.copy],
    npmSourceFiles,
    utils.execCallback,
  );
});

exports.cwd = cwd;
exports.excludeDistDir = excludeDistDir;
exports.baseDir = baseDir;
exports.sourceFiles = sourceFiles;
exports.sourceType = sourceType;
exports.commonStream = commonStream;
exports.getTSProject = getTSProject;
