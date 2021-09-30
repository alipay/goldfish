import useGlobalData from './useGlobalData';
import { default as App, app } from '../common/App';

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

export interface IViewMapper {
  showToast?: (item: IToastOption) => Promise<void>;
  alert?: (item: IAlertOption) => Promise<void>;
  confirm?: (item: IConfirmOption) => Promise<void>;
  prompt?: (item: IPromptOption) => Promise<void>;
}

export class Feedback {
  private feedbackQueue: FeedbackOption[] = [];

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

  private isDestroyed = false;

  private viewMapper: IViewMapper = {
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
  };

  public addFeedback(fb: FeedbackOption) {
    this.feedbackQueue.push(fb);
    this.consumeFeedback();
  }

  private async consumeFeedback() {
    const options = this.viewMapper;

    if (this.isFeedbackConsuming || this.isDestroyed) {
      return;
    }
    this.isFeedbackConsuming = true;

    const queue = [...this.feedbackQueue];
    for (let i = 0, il = queue.length; i < il; i++) {
      if (this.isDestroyed) {
        break;
      }

      const item = queue[i];

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

      if (this.feedbackQueue.length) {
        this.consumeFeedback();
      }
    }
  }

  public setView(view: Partial<View>) {
    this.view = {
      ...this.view,
      ...view,
    };
  }

  public destroy() {
    this.feedbackQueue = [];
    this.isDestroyed = true;
  }
}

export default function useFeedback(passInApp?: App) {
  const realGlobal = passInApp || app;
  const storage = useGlobalData<{ $$feedback?: Feedback }>(realGlobal);

  let feedback = storage.get('$$feedback');
  if (!feedback) {
    feedback = new Feedback();
    storage.set('$$feedback', feedback);
  }

  // Only for type detection.
  const realFeedback = feedback;

  return {
    setView(options: Parameters<Feedback['setView']>[0]) {
      realFeedback.setView(options);
    },
    addToast(option: InputToastOption) {
      realFeedback.addFeedback({
        ...option,
        popType: 'toast',
        isBlock: 'isBlock' in option ? option.isBlock : false,
        duration: 'duration' in option ? option.duration : 2000,
      });
    },
    addAlert(option: InputAlertOption) {
      realFeedback.addFeedback({
        ...option,
        popType: 'alert',
        isBlock: 'isBlock' in option ? option.isBlock : true,
      });
    },
    addConfirm(option: InputConfirmOption) {
      realFeedback.addFeedback({
        ...option,
        popType: 'confirm',
        isBlock: 'isBlock' in option ? option.isBlock : true,
      });
    },
    addPrompt(option: InputPromptOption) {
      realFeedback.addFeedback({
        ...option,
        popType: 'prompt',
        isBlock: 'isBlock' in option ? option.isBlock : true,
      });
    },
  };
}
