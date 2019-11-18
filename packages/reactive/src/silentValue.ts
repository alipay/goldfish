const SILENT_FLAG = {};
const SILENT_KEY = '__silent__';

export function isSilentValue(v: any) {
  return v && v[SILENT_KEY] === SILENT_FLAG;
}

// Convert the value to `silent value`.
// Setting `silent value` to the observable object will not trigger the `change callback`.
export default function silentValue(...args: any[]) {
  if (!args.length) {
    return;
  }

  if (args.length === 1) {
    return isSilentValue(args[0])
      ? args[0]
      : {
        [SILENT_KEY]: SILENT_FLAG,
        value: args[0],
      };
  }

  return args.map((v) => {
    return isSilentValue(v)
      ? v
      : {
        [SILENT_KEY]: SILENT_FLAG,
        value: v,
      };
  });
}
