/* eslint-disable react-hooks/rules-of-hooks */
import { FeedbackPlugin } from '@goldfishjs/plugins';
import { default as App, app } from '../App';
import useGlobalDestroy from '../useGlobalDestroy';

const KEY = 'plugin.feedback';

export default function useFeedback(passInApp?: App) {
  const realGlobal = passInApp || app;

  if (!realGlobal.normalData[KEY]) {
    const feedback = new FeedbackPlugin();
    realGlobal.normalData[KEY] = feedback;
    useGlobalDestroy(() => {
      feedback.destroy();
    });
  }

  return realGlobal.normalData[KEY] as FeedbackPlugin;
}
