import { RequestOptions, Request, withForceUpdate } from './types';
import cache from './utils/cache';
import createRequest from './index';

function createCacheRequest<M = Record<string, any>>(
  options?: RequestOptions,
): Request<M> & withForceUpdate<Request<M>> {
  const request = createRequest<M>(options);
  return cache(request) as Request<M> & withForceUpdate<Request<M>>;
}

export default createCacheRequest;
