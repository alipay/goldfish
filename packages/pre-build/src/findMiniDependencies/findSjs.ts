import path from 'path';
import Parser from 'fastparse';
import fs from 'fs-extra';
import lodash from 'lodash';
import fileCache from './fileCache';

const processMatch = function (this: any, match: any, strUntilValue: any, name: any, value: any, index: number) {
  if (!this.isRelevantTagAttr(this.currentTag, name)) return;
  this.results.push({
    start: index + strUntilValue.length,
    length: value.length,
    value,
    name,
    tag: this.currentTag,
  });
};

const parser = new Parser({
  outside: {
    '<!--.*?-->': true,
    '<![CDATA[.*?]]>': true,
    '<[!\\?].*?>': true,
    '</[^>]+>': true,
    '<([a-zA-Z\\-:]+)\\s*': function (this: any, match: any, tagName: any) {
      this.currentTag = tagName;
      return 'inside';
    },
  },
  inside: {
    '\\s+': true, // eat up whitespace
    '>': 'outside', // end of attributes
    '(([0-9a-zA-Z\\-:]+)\\s*=\\s*")([^"]*)"': processMatch,
    "(([0-9a-zA-Z\\-:]+)\\s*=\\s*')([^']*)'": processMatch,
    '(([0-9a-zA-Z\\-:]+)\\s*=\\s*)([^\\s>]+)': processMatch,
  },
});

function parse(
  html: string,
  isRelevantTagAttr: (tag: string, attr: string) => boolean,
): Array<{ tag: string; value: string }> {
  return parser.parse('outside', html, {
    currentTag: null,
    results: [],
    isRelevantTagAttr,
  }).results;
}

type Axml = {
  configFilePath: string;
  configPath: string;
  sjsPath: string;
};

export default function findSjs(axmlPath: string): Axml[] {
  return fileCache.run('findSjs', axmlPath, () => {
    const axmlContent = fs.readFileSync(axmlPath).toString('utf-8');
    const links = parse(axmlContent, (tag: string, attr: string) => {
      const res = ['import-sjs:from', 'import:src', 'include:src'].find(a => {
        if (a.charAt(0) === ':') {
          return attr === a.slice(1);
        } else {
          return tag + ':' + attr === a;
        }
      });
      return !!res;
    });

    const result = lodash.flatten(
      links.map(link => {
        if (link.tag === 'import-sjs') {
          return {
            configFilePath: axmlPath,
            configPath: link.value,
            sjsPath: path.resolve(path.dirname(axmlPath), link.value),
          };
        }

        if (link.tag === 'import' || link.tag === 'include') {
          return findSjs(path.resolve(path.dirname(axmlPath), link.value));
        }

        return [];
      }),
    );
    return result;
  });
}
