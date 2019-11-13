import { observable, state } from '@alipay/goldfish-reactive-connect';
import { default as Plugin, GetPlugin } from './Plugin';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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
  complete?: (result: { ok?: boolean; cancel?: boolean, inputValue?: string }) => void;
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

@observable
export default class extends Plugin {
  public static readonly type = 'feedback';

  @state
  public feedbackQueue: FeedbackOption[] = [];

  public init(getPlugin: GetPlugin) {}

  public addToast(option: InputToastOption) {
    this.feedbackQueue.push({
      ...option,
      popType: 'toast',
      isBlock: 'isBlock' in option ? option.isBlock : false,
      duration: 'duration' in option ? option.duration : 2000,
    });
  }

  public addAlert(option: InputAlertOption) {
    this.feedbackQueue.push({
      ...option,
      popType: 'alert',
      isBlock: 'isBlock' in option ? option.isBlock : true,
    });
  }

  public addConfirm(option: InputConfirmOption) {
    this.feedbackQueue.push({
      ...option,
      popType: 'confirm',
      isBlock: 'isBlock' in option ? option.isBlock : true,
    });
  }

  public addPrompt(option: InputPromptOption) {
    this.feedbackQueue.push({
      ...option,
      popType: 'prompt',
      isBlock: 'isBlock' in option ? option.isBlock : true,
    });
  }

  public destroy() {
    this.feedbackQueue = [];
  }
}
