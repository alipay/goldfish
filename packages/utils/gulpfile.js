const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gulpReplace = require('gulp-replace');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([]);

gulp.task('copy', () => {
  return gulp
    .src(['./src/lodash/**/*'])
    .pipe(gulpIf(file => /now\.js$/.test(file.path), gulpReplace(/root\.Date\.now\(\)/, 'Date.now()')))
    .pipe(gulp.dest('./lib/lodash'));
});
