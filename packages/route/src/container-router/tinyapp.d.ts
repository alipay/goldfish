declare namespace my {
  export function redirectTo(options: {
    url: string;
    success?: Function;
    fail?: Function;
    complete?: Function;
  }): void;

  export function navigateTo(options: {
    url: string;
    success?: Function;
    fail?: Function;
    complete?: Function;
  }): void;

  export function navigateBack(options: {
    delta: number;
  }): void;
}
