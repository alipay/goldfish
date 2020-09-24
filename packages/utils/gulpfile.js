const gulp = require('gulp');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([]);

gulp.task('copy', () => {
  return gulp.src(['./src/lodash/**/*']).pipe(gulp.dest('./lib/lodash'));
});
