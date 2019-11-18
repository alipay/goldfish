import { cache, WithForceUpdate } from '@alipay/goldfish-utils';
import { RequestOptions, Request } from './types';
import createRequest from './createRequest';

function createCacheRequest<M = Record<string, any>>(
  options?: RequestOptions,
): Request<M> & WithForceUpdate<Request<M>> {
  const request = createRequest<M>(options);
  return cache(request) as Request<M> & WithForceUpdate<Request<M>>;
}

export default createCacheRequest;
