/* eslint-disable react-hooks/rules-of-hooks */
import { observable, state } from '@goldfishjs/reactive-connect';
import { watch } from '@goldfishjs/reactive';
import useGlobalStorage from './useGlobalStorage';
import { default as App, app } from './App';
import useGlobalDestroy from './useGlobalDestroy';

export interface IToastOption {
  popType: 'toast';
  type?: 'none' | 'success' | 'fail' | 'exception';
  duration?: number;
  content?: string;
  complete?: () => void;
  isBlock?: boolean;
}

export type InputToastOption = Omit<IToastOption, 'popType'>;

export interface IAlertOption {
  popType: 'alert';
  title?: string;
  content?: string;
  buttonText?: string;
  complete?: () => void;
  isBlock?: boolean;
}

export type InputAlertOption = Omit<IAlertOption, 'popType'>;

export interface IPromptOption {
  popType: 'prompt';
  title?: string;
  content?: string;
  placeholder?: string;
  align?: 'left' | 'center' | 'right';
  okButtonText?: string;
  cancelButtonText?: string;
  complete?: (result: { ok?: boolean; cancel?: boolean; inputValue?: string }) => void;
  isBlock?: boolean;
}

export type InputPromptOption = Omit<IPromptOption, 'popType'>;

export interface IConfirmOption {
  popType: 'confirm';
  content?: string;
  title?: string;
  okButtonText?: string;
  cancelButtonText?: string;
  complete?: (result: { ok?: boolean; cancel?: boolean }) => void;
  isBlock?: boolean;
}

export type InputConfirmOption = Omit<IConfirmOption, 'popType'>;

export type FeedbackOption = IToastOption | IAlertOption | IConfirmOption | IPromptOption;

export type View = {
  showToast: typeof my.showToast;
  hideToast: typeof my.hideToast;
  alert: typeof my.alert;
  prompt: typeof my.prompt;
  confirm: typeof my.confirm;
};

@observable
export class Feedback {
  private stopWatchFeedbackQueue: (() => void) | undefined;

  @state
  public feedbackQueue: FeedbackOption[] = [];

  private view?: Partial<View> =
    typeof my === 'undefined'
      ? undefined
      : {
          showToast: my.showToast,
          hideToast: my.hideToast,
          alert: my.alert,
          prompt: my.prompt,
          confirm: my.confirm,
        };

  private isFeedbackConsuming = false;

  private shouldStopIteration = false;

  private async consumeFeedback(options: {
    showToast?: (item: IToastOption) => Promise<void>;
    alert?: (item: IAlertOption) => Promise<void>;
    confirm?: (item: IConfirmOption) => Promise<void>;
    prompt?: (item: IPromptOption) => Promise<void>;
  }) {
    if (this.isFeedbackConsuming) {
      return;
    }
    this.isFeedbackConsuming = true;

    const queue = [...this.feedbackQueue];
    for (let i = 0, il = queue.length; i < il; i++) {
      const item = queue[i];
      if (this.shouldStopIteration) {
        return true;
      }

      switch (item.popType) {
        case 'toast':
          await (options.showToast && options.showToast(item));
          break;
        case 'alert':
          await (options.alert && options.alert(item));
          break;
        case 'confirm':
          await (options.confirm && options.confirm(item));
          break;
        case 'prompt':
          await (options.prompt && options.prompt(item));
          break;
      }
    }

    this.isFeedbackConsuming = false;

    if (this.feedbackQueue.length && queue.length) {
      this.feedbackQueue.splice(0, queue.length);
    }
  }

  private startWatchFeedbackQueue(options: {
    showToast?: (item: IToastOption) => Promise<void>;
    alert?: (item: IAlertOption) => Promise<void>;
    confirm?: (item: IConfirmOption) => Promise<void>;
    prompt?: (item: IPromptOption) => Promise<void>;
  }) {
    if (this.stopWatchFeedbackQueue) {
      return this.stopWatchFeedbackQueue;
    }

    const stop = watch(
      () => this.feedbackQueue,
      () => {
        return this.consumeFeedback(options);
      },
      {
        immediate: true,
      },
    );
    this.stopWatchFeedbackQueue = () => {
      stop();
      this.stopWatchFeedbackQueue = undefined;
      this.shouldStopIteration = true;
    };
    return this.stopWatchFeedbackQueue;
  }

  public init() {
    this.startWatchFeedbackQueue({
      showToast: (item): Promise<void> => {
        return new Promise(resolve => {
          this.view?.showToast?.(item);
          if (item.isBlock || item.duration) {
            if (item.duration) {
              setTimeout(() => resolve(), item.duration);
            } else {
              resolve();
              this.view?.hideToast?.();
            }
          } else {
            this.view?.hideToast?.();
            resolve();
          }
        });
      },
      alert: item => {
        return new Promise(resolve => {
          if (item.isBlock) {
            this.view?.alert?.({
              ...item,
              complete: () => {
                resolve();
                if (item.complete) {
                  item.complete();
                }
              },
            });
          } else {
            this.view?.alert?.(item);
            resolve();
          }
        });
      },
      confirm: item => {
        return new Promise(resolve => {
          this.view?.confirm?.({
            ...item,
            confirmButtonText: item.okButtonText,
            complete: result => {
              if (item.isBlock) {
                resolve();
              }
              if (item.complete) {
                item.complete(result.confirm ? { ok: true, cancel: false } : { ok: false, cancel: true });
              }
            },
          });
          if (!item.isBlock) {
            resolve();
          }
        });
      },
      prompt: item => {
        return new Promise(resolve => {
          this.view?.prompt?.({
            ...item,
            message: item.content || 'prompt',
            success: result => {
              item.complete &&
                item.complete(
                  result.ok
                    ? {
                        ok: true,
                        cancel: false,
                        inputValue: result.inputValue,
                      }
                    : {
                        ok: false,
                        cancel: true,
                      },
                );
            },
            fail: () => {
              item.complete && item.complete({ ok: false, cancel: false });
            },
            complete: resolve,
          });
        });
      },
    });
  }

  public setView(view: Partial<View>) {
    this.view = {
      ...this.view,
      ...view,
    };
  }

  public destroy() {
    this.stopWatchFeedbackQueue && this.stopWatchFeedbackQueue();
    this.stopWatchFeedbackQueue = undefined;
    this.feedbackQueue = [];
  }
}

export default function useFeedback(passInApp?: App) {
  const realGlobal = passInApp || app;
  const storage = useGlobalStorage<{ $$feedback?: Feedback }>(realGlobal);

  let feedback = storage.get('$$feedback');
  if (!feedback) {
    feedback = new Feedback();
    feedback.init();
    storage.set('$$feedback', feedback);

    useGlobalDestroy(() => {
      if (feedback) {
        feedback.destroy();
        storage.set('$$feedback', undefined);
      }
    }, passInApp);
  }

  // Only for type detection.
  const realFeedback = feedback;

  return {
    setView(options: Parameters<Feedback['setView']>[0]) {
      realFeedback.setView(options);
    },
    addToast(option: InputToastOption) {
      realFeedback.feedbackQueue.push({
        ...option,
        popType: 'toast',
        isBlock: 'isBlock' in option ? option.isBlock : false,
        duration: 'duration' in option ? option.duration : 2000,
      });
    },
    addAlert(option: InputAlertOption) {
      realFeedback.feedbackQueue.push({
        ...option,
        popType: 'alert',
        isBlock: 'isBlock' in option ? option.isBlock : true,
      });
    },
    addConfirm(option: InputConfirmOption) {
      realFeedback.feedbackQueue.push({
        ...option,
        popType: 'confirm',
        isBlock: 'isBlock' in option ? option.isBlock : true,
      });
    },
    addPrompt(option: InputPromptOption) {
      realFeedback.feedbackQueue.push({
        ...option,
        popType: 'prompt',
        isBlock: 'isBlock' in option ? option.isBlock : true,
      });
    },
  };
}
