import less from 'gulp-less';
import NpmImportPlugin from 'less-plugin-npm-import';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import replace from 'gulp-replace';
import getBabelConfig from './getBabelConfigNext';
import getUserConfig from './getUserConfig';

interface Processor {
  [key: string]: {
    name: string;
    handler(options, stream: NodeJS.ReadWriteStream): NodeJS.ReadWriteStream;
  }[];
}

export const processors: Processor = {
  less: [
    {
      name: 'less-complie',
      handler() {
        return less({
          javascriptEnabled: true,
          plugins: [new NpmImportPlugin({ prefix: '~' })],
        });
      },
    },
    {
      name: 'postcss',
      handler() {
        return postcss(file => {
          return {
            plugins: [
              require('autoprefixer')({}),
              require('postcss-px-to-viewport')({
                viewportWidth: /mini-antui/.test(file.relative) ? 750 / 2 : 750,
              }),
            ],
          };
        });
      },
    },
    {
      name: 'rename',
      handler() {
        return rename({
          extname: '.acss',
        });
      },
    },
  ],
  ts: [
    {
      name: 'replace',
      handler(_, stream) {
        const envMap = {
          'process.env.NODE_ENV': process.env.NODE_ENV,
          'process.env.GOLDFISH_ENV': process.env.GOLDFISH_ENV,
        };

        return Object.entries(envMap).reduce((stream, [key, value]) => {
          return stream.pipe(replace(key, JSON.stringify(value)));
        }, stream);
      },
    },
    {
      name: 'babel',
      handler(options) {
        return babel(getBabelConfig(options));
      },
    },
  ],
  copy: [],
  js: [
    {
      name: 'replace',
      handler(_, stream) {
        const envMap = {
          'process.env.NODE_ENV': process.env.NODE_ENV,
          'process.env.GOLDFISH_ENV': process.env.GOLDFISH_ENV,
        };

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
  ],
}; 

export default function getProcessors(type: string) {
  const { prebuild } = getUserConfig();
  const { gulp } = prebuild || {};
  const fn = gulp?.[type] || (v => v);
  return fn(processors[type]);
};
