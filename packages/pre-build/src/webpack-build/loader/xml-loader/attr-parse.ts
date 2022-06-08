import Parser from 'fastparse';

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

export default function parse(
  html: string,
  isRelevantTagAttr: (tag: string, attr: string) => boolean,
): Array<{ tag: string; value: string }> {
  return parser.parse('outside', html, {
    currentTag: null,
    results: [],
    isRelevantTagAttr,
  }).results;
}
