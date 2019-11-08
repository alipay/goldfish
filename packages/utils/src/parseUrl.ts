const urlParseRE = /^\s*(((([^:/#?]+:)?(?:(\/\/)((?:(([^:@/#?]+)(?::([^:@/#?]+))?)@)?(([^:/#?\][]+|\[[^/\]@#?]+\])(?::([0-9]+))?))?)?)?((\/?(?:[^/?#]+\/+)*)([^?#]*)))?(\?[^#]+)?)(#.*)?/;

type Keys =
  | 'href'
  | 'hrefNoHash'
  | 'hrefNoSearch'
  | 'domain'
  | 'protocol'
  | 'doubleSlash'
  | 'authority'
  | 'username'
  | 'password'
  | 'host'
  | 'hostname'
  | 'port'
  | 'pathname'
  | 'directory'
  | 'filename'
  | 'search'
  | 'hash';

type UrlParseResult = {
  [key in Keys]: string;
};

function parseUrl(url: string): UrlParseResult {
  const matches = urlParseRE.exec(url || '') || [];

  return {
    href: matches[0] || '',
    hrefNoHash: matches[1] || '',
    hrefNoSearch: matches[2] || '',
    domain: matches[3] || '',
    protocol: matches[4] || '',
    doubleSlash: matches[5] || '',
    authority: matches[6] || '',
    username: matches[8] || '',
    password: matches[9] || '',
    host: matches[10] || '',
    hostname: matches[11] || '',
    port: matches[12] || '',
    pathname: matches[13] || '',
    directory: matches[14] || '',
    filename: matches[15] || '',
    search: matches[16] || '',
    hash: matches[17] || '',
  };
}

export default parseUrl;
