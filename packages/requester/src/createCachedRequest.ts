import { RequestOptions, Request, WithForceUpdate } from './utils/types';
import cache from './utils/cache';
import createRequest from './index';

function createCacheRequest<M = Record<string, any>>(
  options?: RequestOptions,
): Request<M> & WithForceUpdate<Request<M>> {
  const request = createRequest<M>(options);
  return cache(request) as Request<M> & WithForceUpdate<Request<M>>;
}

export default createCacheRequest;
