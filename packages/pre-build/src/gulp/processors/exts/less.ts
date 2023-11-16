import less from 'gulp-less';
import NpmImportPlugin from 'less-plugin-npm-import';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';

export default [
  {
    name: 'less',
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
      return rename({ extname: '.acss' });
    },
  },
];
