import replace from 'gulp-replace';
import { Processor } from '../../types';

const envMap = {
  'process.env.NODE_ENV': process.env.NODE_ENV,
  'process.env.GOLDFISH_ENV': process.env.GOLDFISH_ENV,
};

export default <Processor[]>[
  {
    name: 'replace',
    handler({stream}) {
      return Object.entries(envMap).reduce((stream, [key, value]) => {
        return stream.pipe(replace(key, JSON.stringify(value)));
      }, stream);
    },
  },
  {
    name: 'assets',
    handler() {
      return replace('./assets/', function () {
        // @ts-ignore
        return `/${this.file.relative.replace(this.file.basename, '')}assets/`;
      });
    },
  },
];
