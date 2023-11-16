
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import path from 'path';
import { error } from '../../utils'

export default [
  {
    name: 'error',
    handler() {
      return plumber(error);
    },
  },
  {
    name: 'record-end',
    desc: '记录处理后的产物',
    handler({ options, travelData }) {
      return rename(function (_path) {
        const origin = _path.dirname + path.sep + _path.basename + _path.extname;
        travelData.files[travelData.files.length - 1].output = path.resolve(options.distDir, origin);
      });
    },
  },
];
