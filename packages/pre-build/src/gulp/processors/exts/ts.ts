import babel from 'gulp-babel';
import replace from 'gulp-replace';
import getBabelConfig from '../../getBabelConfigNext';

const envMap = {
  'process.env.NODE_ENV': process.env.NODE_ENV,
  'process.env.GOLDFISH_ENV': process.env.GOLDFISH_ENV,
};

export default [
  {
    name: 'replace',
    handler({stream}) {
      return Object.entries(envMap).reduce((stream, [key, value]) => {
        return stream.pipe(replace(key, JSON.stringify(value)));
      }, stream);
    },
  },
  {
    name: 'babel',
    handler({options}) {
      return babel(getBabelConfig(options));
    },
  },
];
