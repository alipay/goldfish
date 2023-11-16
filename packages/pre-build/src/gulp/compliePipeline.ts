import gulp from 'gulp'
import { CombinePipe } from './types';

export default function compliePipeline(value: CombinePipe) {
  const { fileGulp, options } = value;
  const { glob, processors } = fileGulp;

  const baseStream = gulp.src(glob, { base: options.baseDir });
  const stream = processors.reduce((stream, processor) => stream.pipe(processor.handler({...value, stream})), baseStream);
  return stream.pipe(gulp.dest(options.distDir));
}
