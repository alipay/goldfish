function mockUrl(fullPath: string, mock?: string | boolean): string {
  const a = document.createElement('a');
  a.href = fullPath;
  if (!mock) return fullPath;
  if (mock === true) {
    mock = '';
  } else if (mock.indexOf('http') !== 0) {
    mock = `http://${mock}`;
  }
  return fullPath.replace(`${a.protocol}//${a.host}`, mock);
}

export default mockUrl;
