export const MAIN_PACKAGE = 'main'
export const jsonExt = '.json'
export const useComp = 'usingComponents'
export const usePluginComp = 'publicComponents'
export const empty = ''

export const runtimeCodeCtxObject =
  'var context = (function() { return this })() || Function("return this")();\n'

export const regeneratorRuntimeFix = 'var regeneratorRuntime\n'

export const runtimeCodeFixBabel = `
try {
  if(!context.console){
    context.console = console;
    context.setInterval = setInterval;
    context.setTimeout = setTimeout;
    context.JSON = JSON;
    context.Math = Math;
    context.Date = Date;
    context.RegExp = RegExp;
    context.Infinity = Infinity;
    context.isFinite = isFinite;
    context.parseFloat = parseFloat;
    context.parseInt = parseInt;
    context.Promise = Promise;
    context.WeakMap = WeakMap;
    context.RangeError = RangeError;
    context.TypeError = TypeError;
    context.Uint8Array = Uint8Array;
    context.DataView = DataView;
    context.ArrayBuffer = ArrayBuffer;
    context.Symbol = Symbol;
    context.Reflect = Reflect;
    context.Object = Object;
    context.Error = Error;
    context.Array = Array;
    context.Float32Array = Float32Array;
    context.Float64Array = Float64Array;
    context.Int16Array = Int16Array;
    context.Int32Array = Int32Array;
    context.Int8Array = Int8Array;
    context.Uint16Array = Uint16Array;
    context.Uint32Array = Uint32Array;
    context.Uint8ClampedArray = Uint8ClampedArray;
    context.String = String;
    context.Function = Function;
    context.SyntaxError = SyntaxError;
    context.decodeURIComponent = decodeURIComponent;
    context.encodeURIComponent = encodeURIComponent;
  }
} catch(e){
}\n`
