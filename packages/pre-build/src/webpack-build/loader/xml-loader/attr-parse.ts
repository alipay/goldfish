import Parser from 'fastparse'

const processMatch = function (match, strUntilValue, name, value, index) {
  if (!this.isRelevantTagAttr(this.currentTag, name)) return
  this.results.push({
    start: index + strUntilValue.length,
    length: value.length,
    value,
    name,
    tag: this.currentTag,
  })
}

const parser = new Parser({
  outside: {
    '<!--.*?-->': true,
    '<![CDATA[.*?]]>': true,
    '<[!\\?].*?>': true,
    '</[^>]+>': true,
    '<([a-zA-Z\\-:]+)\\s*': function (match, tagName) {
      this.currentTag = tagName
      return 'inside'
    },
  },
  inside: {
    '\\s+': true, // eat up whitespace
    '>': 'outside', // end of attributes
    '(([0-9a-zA-Z\\-:]+)\\s*=\\s*")([^"]*)"': processMatch,
    "(([0-9a-zA-Z\\-:]+)\\s*=\\s*')([^']*)'": processMatch,
    '(([0-9a-zA-Z\\-:]+)\\s*=\\s*)([^\\s>]+)': processMatch,
  },
})

export default function parse(html, isRelevantTagAttr) {
  return parser.parse('outside', html, {
    currentTag: null,
    results: [],
    isRelevantTagAttr,
  }).results
}
