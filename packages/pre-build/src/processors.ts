const gulp = require('gulp');
const ts = require('gulp-typescript');
const less = require('gulp-less');
const NpmImportPlugin = require('less-plugin-npm-import');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const getBabelConfig = require('./getBabelConfig');
const utils = require('./utils');
const alias = require('./lib/@gulp-plugin/alias/index');

const postProcessors = [
  {
    name: 'error',
    handler() {
      return plumber(utils.error);
    },
  },
  {
    name: 'output',
    handler() {
      return gulp.dest(utils.distDir);
    },
  },
];

module.exports.processors = {
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
    ...postProcessors,
  ],
  ts: [
    {
      name: 'replace',
      handler() {
        if (process.env.NODE_ENV) {
          return replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV));
        }
        if (process.env.GOLDFISH_ENV) {
          return replace('process.env.GOLDFISH_ENV', JSON.stringify(process.env.GOLDFISH_ENV));
        }
        return stream => stream;
      },
    },
    {
      name: 'alias',
      handler() {
        return alias(ts.createProject(utils.tsconfigPath).config);
      },
    },
    {
      name: 'babel',
      handler() {
        const babelConfig = getBabelConfig();
        babelConfig.presets.push([require.resolve('@babel/preset-typescript'), {}]);
        return babel(babelConfig);
      },
    },
    ...postProcessors,
  ],
  copy: [...postProcessors],
  js: [
    {
      name: 'replace',
      handler() {
        if (process.env.NODE_ENV) {
          return replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV));
        }
        if (process.env.GOLDFISH_ENV) {
          return replace('process.env.GOLDFISH_ENV', JSON.stringify(process.env.GOLDFISH_ENV));
        }
        return stream => stream;
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
    ...postProcessors,
  ],
  dts: [
    {
      name: 'core',
      handler() {
        const tsProject = utils.getTSProject();
        return tsProject();
      },
    },
    ...postProcessors,
  ],
};
