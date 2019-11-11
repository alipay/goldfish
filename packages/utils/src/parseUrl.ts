const urlParseRE = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^/?:]+):?(\d+)?(\/?[^?#]+)?(\?[^#]+)?(#.*)?/;

type Keys =
  | 'username'
  | 'password'
  | 'port'
  | 'host'
  | 'pathname'
  | 'href'
  | 'search'
  | 'protocol'
  | 'hash';

type UrlParseResult = {
  [key in Keys]: string;
};

function parseUrl(url: string): UrlParseResult {
  const matches = urlParseRE.exec(url || '') || [];

  return {
    href: matches[0] || '',
    protocol: matches[2] || '',
    host: matches[6] || '',
    port: matches[7] || '',
    pathname: matches[8] || '',
    search: matches[9] || '',
    hash: matches[10] || '',
    username: matches[4] || '',
    password: matches[5] || '',
  };
}

export default parseUrl;
