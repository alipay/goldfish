import { RequestOptions, Request, $RequestOptions } from './utils/types';
import takeLatest from './utils/takeLatest';
import createRequest from './index';

function createTakeLatestRequest<M>(options?: RequestOptions): Request<M> {
  const request = createRequest<M>({ ...options, $$takeLatest: true } as $RequestOptions);
  return takeLatest(request);
}

export default createTakeLatestRequest;
