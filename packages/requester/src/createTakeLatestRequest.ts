import { RequestOptions, Request } from './utils/types';
import takeLatest from './utils/takeLatest';
import { $$innerCreateRequest } from './index';

function createTakeLatestRequest<M>(options?: RequestOptions): Request<M> {
  const request = $$innerCreateRequest<M>({ ...options, $$takeLatest: true });
  return takeLatest(request) as Request<M>;
}

export default createTakeLatestRequest;
