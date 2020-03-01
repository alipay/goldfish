import { FeedbackPlugin } from '@goldfishjs/plugins';
import { default as Global, global } from '../Global';
import useGlobalDestroy from '../useGlobalDestroy';

const KEY = 'plugin.feedback';

export default function useFeedback(passInGlobal?: Global) {
  const realGlobal = passInGlobal || global;

  if (!realGlobal.normalData[KEY]) {
    const feedback = new FeedbackPlugin();
    realGlobal.normalData[KEY] = feedback;
    useGlobalDestroy(() => {
      feedback.destroy();
    });
  }

  return realGlobal.normalData[KEY] as FeedbackPlugin;
}
