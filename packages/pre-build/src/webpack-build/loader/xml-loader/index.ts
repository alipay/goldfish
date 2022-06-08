import path from 'path';
import { LoaderContext } from 'webpack';
import attrParse from './attr-parse';
import ampEntry from '../../ampEntry';
import { isRelativeUrl } from '../../utils';
import { addQuery } from '../addQuery';

const assetSet = new Set();

module.exports = function xmlLoader(this: LoaderContext<{}>, source: string) {
  const { dir } = path.parse(this.resourcePath);
  const output = ampEntry.getResourceOutput(this.resourcePath);

  const attributes = ['import-sjs:from'];

  const links = attrParse(source, (tag: string, attr: string) => {
    const res = attributes.find(a => {
      if (a.charAt(0) === ':') {
        return attr === a.slice(1);
      } else {
        return tag + ':' + attr === a;
      }
    });
    return !!res;
  });

  links
    .filter(link => isRelativeUrl(link.value))
    .forEach(link => {
      const currentPath = path.resolve(dir, link.value);
      const outputPath = path.resolve(path.parse(output).dir, link.value);

      if (!assetSet.has(currentPath)) {
        ampEntry.addSjsEntry(outputPath, currentPath);
        assetSet.add(currentPath);
      }
    });

  return addQuery([]);
};
