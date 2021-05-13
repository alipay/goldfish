export default function appendFn(options: Record<string, any>, name: string, fns: Function[]) {
  if (!options[name]) {
    options[name] = function (...args: any[]) {
      fns.forEach(fn => {
        fn.call(this, ...args);
      });
    };
  } else if (typeof options[name] === 'function') {
    options[name] = function (...args: any[]) {
      options[name].call(this, ...args);
      fns.forEach(fn => {
        fn.call(this, ...args);
      });
    };
  } else {
    throw new Error(`The '${name}' prop is not a 'function' prop.`);
  }
}
