import { parse, resolve } from 'path';
import { getOptions, parseQuery } from 'loader-utils';
import { ampEntry } from '../entry';

// 直接输出文件
module.exports = function (this: any, source: any) {
  let output = ampEntry.getResourceOutput(this.resourcePath, true);
  const options = getOptions(this);

  if (this.resourceQuery) {
    const query = parseQuery(this.resourceQuery) as { output: string };
    output = query.output || output;
  }

  if (options.ext) {
    const { dir, name } = parse(output);
    this.emitFile(resolve(dir, `${name}${options.ext}`), source);
  } else {
    this.emitFile(output, source);
  }

  return `
    module.exports = { resourcePath: "${this.resourcePath}", outputPath: "${output}" }
  `;
};

module.exports.raw = true;
