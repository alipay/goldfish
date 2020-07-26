import parseUrl, { Keys } from '../src/parseUrl';

const keys: Array<Keys> = ['username', 'password', 'port', 'host', 'pathname', 'href', 'search', 'protocol', 'hash'];

describe('Test parseUrl', () => {
  it('fullUrl https://abc:xyz@example.com:8080/123/asdasd?a=1&c=123#b=2', () => {
    const url = 'https://abc:xyz@example.com:8080/123/asdasd?a=1&c=123#b=2';
    const parseResult = parseUrl(url);
    const resultsMap: any = {
      hash: '#b=2',
      host: 'example.com',
      href: url,
      password: 'xyz',
      username: 'abc',
      pathname: '/123/asdasd',
      port: '8080',
      protocol: 'https',
      search: '?a=1&c=123',
    };
    keys.forEach(key => {
      expect(parseResult[key]).toBe(resultsMap[key] || '');
    });
  });
  it('url https://example.com', () => {
    const url = 'https://example.com';
    const parseResult = parseUrl(url);
    const resultsMap: any = {
      href: url,
      host: 'example.com',
      protocol: 'https',
    };
    keys.forEach(key => {
      expect(parseResult[key]).toBe(resultsMap[key] || '');
    });
  });
  it('url https://example.com:8080', () => {
    const url = 'https://example.com:8080';
    const parseResult = parseUrl(url);
    const resultsMap: any = {
      href: url,
      host: 'example.com',
      protocol: 'https',
      port: '8080',
    };
    keys.forEach(key => {
      expect(parseResult[key]).toBe(resultsMap[key] || '');
    });
  });
  it('url https://example.com:8080/123/123', () => {
    const url = 'https://example.com:8080/123/123';
    const parseResult = parseUrl(url);
    const resultsMap: any = {
      href: url,
      host: 'example.com',
      protocol: 'https',
      port: '8080',
      pathname: '/123/123',
    };
    keys.forEach(key => {
      expect(parseResult[key]).toBe(resultsMap[key] || '');
    });
  });
  it('url https://example.com:8080/123/123?a=1', () => {
    const url = 'https://example.com:8080/123/123?a=1';
    const parseResult = parseUrl(url);
    const resultsMap: any = {
      href: url,
      host: 'example.com',
      protocol: 'https',
      port: '8080',
      pathname: '/123/123',
      search: '?a=1',
    };
    keys.forEach(key => {
      expect(parseResult[key]).toBe(resultsMap[key] || '');
    });
  });
  it('url https://example.com:8080/123/123?a=1#b=1', () => {
    const url = 'https://example.com:8080/123/123?a=1#b=1';
    const parseResult = parseUrl(url);
    const resultsMap: any = {
      href: url,
      host: 'example.com',
      protocol: 'https',
      port: '8080',
      pathname: '/123/123',
      search: '?a=1',
      hash: '#b=1',
    };
    keys.forEach(key => {
      expect(parseResult[key]).toBe(resultsMap[key] || '');
    });
  });
});
