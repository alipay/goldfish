import { RequestOptions, Request } from './types';
import takeLatest from './utils/takeLatest';
import createRequest from './index';

function createTakeLatestRequest<M>(options?: RequestOptions): Request<M> {
  const request = createRequest<M>(options);
  return takeLatest(request) as Request<M>;
}

export default createTakeLatestRequest;
