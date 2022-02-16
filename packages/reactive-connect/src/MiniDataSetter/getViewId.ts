import { uniqueId } from '@goldfishjs/utils';

const VIEW_ID_KEY = '$$goldfish-view-id';

export default function getViewId(view: Record<string, any>) {
  if (view[VIEW_ID_KEY] === undefined) {
    view[VIEW_ID_KEY] = uniqueId();
  }
  return view[VIEW_ID_KEY];
}
