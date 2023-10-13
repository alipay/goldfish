import replace from 'gulp-replace';
import createGulpConfig, { CreateGulConfigOptions } from './createGulpConfig';
import { processors } from './getProcessors';

export interface CreatePDSGulConfigOptions extends CreateGulConfigOptions {}

export default function createPDSGulpConfig(options: CreatePDSGulConfigOptions) {
  const prefixRE = /^GOLDFISH_APP/;

  const processor = {
    name: `replace-pds-env`,
    handler(_, stream) {
      return Object.entries(process.env).reduce((stream, [key, value]) => {
        if (prefixRE.test(key) || key === 'NODE_ENV') {
          return stream.pipe(replace(`process.env.${key}`, JSON.stringify(value)));
        }
        return stream;
      }, stream);
    },
  };

  processors.js.unshift(processor);
  processors.ts.unshift(processor);

  return createGulpConfig(options);
}
