import { RequestOptions, Request, $RequestOptions } from './types';
import { takeLatest } from '@alipay/goldfish-utils';
import createRequest from './createRequest';

function createTakeLatestRequest<M>(options?: RequestOptions): Request<M> {
  const request = createRequest<M>({ ...options, $$takeLatest: true } as $RequestOptions);
  return takeLatest(request);
}

export default createTakeLatestRequest;
