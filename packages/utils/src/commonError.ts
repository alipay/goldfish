export interface ICommonError {
  message: string;
  code:
    | 'UNKNOWN'
    | 'UNSUPPORTED'
    | 'Error'
    | 'TypeError'
    | 'EvalError'
    | 'InternalError'
    | 'RangeError'
    | 'ReferenceError'
    | 'SyntaxError'
    | 'URIError'
    | string;
  raw: any;
}

export default async function commonError(val: any): Promise<[any, ICommonError?]> {
  if (typeof val === 'function') {
    try {
      const result = await val();
      return [result];
    } catch (e) {
      return commonError(e);
    }
  }

  if (val instanceof Error) {
    return [
      undefined,
      {
        code: val.name,
        message: val.message,
        raw: val,
      },
    ];
  }

  if (typeof val === 'string') {
    return [
      undefined,
      {
        code: 'UNKNOWN',
        message: val,
        raw: val,
      },
    ];
  }

  return [
    undefined,
    {
      code: 'UNSUPPORTED',
      message: 'unsupported error',
      raw: val,
    },
  ];
}
