import rename from 'gulp-rename'
import path from 'path'
import { Processor } from '../types';

export default <Processor[]>[
  {
    name: 'record-start',
    desc: '记录初始的待处理的文件',
    handler({ options, travelData, fileGulp }) {
      return rename(function (_path) {
        const source = _path.dirname + path.sep + _path.basename + _path.extname;
        travelData.files.push({
          source: path.resolve(options.baseDir, source),
          output: path.resolve(options.distDir, source),
          type: fileGulp.type,
        });
      });
    },
  },
];
