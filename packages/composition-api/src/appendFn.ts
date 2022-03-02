export default function appendFn(options: Record<string, any>, name: string, fns: Function[]) {
  if (!options[name]) {
    options[name] = function (...args: any[]) {
      let result: any;
      fns.forEach(fn => {
        result = fn.call(this, ...args);
      });
      return result;
    };
  } else if (typeof options[name] === 'function') {
    options[name] = function (...args: any[]) {
      let result = options[name].call(this, ...args);
      fns.forEach(fn => {
        result = fn.call(this, ...args);
      });
      return result;
    };
  } else {
    throw new Error(`The '${name}' prop is not a 'function' prop.`);
  }
}
