import { parseUrl } from '@alipay/goldfish-utils';


function mockUrl(fullPath: string, mock?: string | boolean): string {
  if (!mock) return fullPath;
  if (mock === true) {
    mock = '';
  } else if (mock.indexOf('http') !== 0) {
    mock = `http://${mock}`;
  }
  const parseResult = parseUrl(fullPath);
  return fullPath.replace(`${parseResult.protocol}//${parseResult.host}`, mock);
}

export default mockUrl;
